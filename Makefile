# extract name from package.json
PACKAGE_NAME := $(shell awk '/"name":/ {gsub(/[",]/, "", $$2); print $$2}' package.json)
VERSION := $(shell T=$$(git describe 2>/dev/null) || T=1; echo $$T | tr '-' '.')
ifeq ($(TEST_OS),)
TEST_OS = centos-7
endif
export TEST_OS
TARFILE=cockpit-$(PACKAGE_NAME)-$(VERSION).tar.gz
RPMFILE=$(shell rpmspec -D"VERSION $(VERSION)" -q cockpit-samba-ad-dc.spec.in).rpm
VM_IMAGE=$(CURDIR)/test/images/$(TEST_OS)
# stamp file to check if/when npm install ran
NODE_MODULES_TEST=package-lock.json
# one example file in dist/ from vite to check if that already ran
VITE_TEST=dist/index.html

all: $(VITE_TEST)

#
# Build/Install/dist
#

%.spec: %.spec.in
	sed -e 's/%{VERSION}/$(VERSION)/g' $< > $@

$(VITE_TEST): $(NODE_MODULES_TEST) $(shell find src/ -type f) package.json vite.config.ts
	NODE_ENV=$(NODE_ENV) npm run build

watch:
	NODE_ENV=$(NODE_ENV) npm run watch

clean:
	rm -rf dist/
	[ ! -e cockpit-$(PACKAGE_NAME).spec.in ] || rm -f cockpit-$(PACKAGE_NAME).spec

install: $(VITE_TEST)
	mkdir -p $(DESTDIR)/usr/share/cockpit/$(PACKAGE_NAME)
	cp -r dist/* $(DESTDIR)/usr/share/cockpit/$(PACKAGE_NAME)
	mkdir -p $(DESTDIR)/usr/share/metainfo/
	cp org.cockpit-project.$(PACKAGE_NAME).metainfo.xml $(DESTDIR)/usr/share/metainfo/

# this requires a built source tree and avoids having to install anything system-wide
devel-install: $(VITE_TEST)
	mkdir -p ~/.local/share/cockpit
	ln -s `pwd`/dist ~/.local/share/cockpit/$(PACKAGE_NAME)

dist-gzip: $(TARFILE)

# when building a distribution tarball, call vite with a 'production' environment
# we don't ship node_modules for license and compactness reasons; we ship a
# pre-built dist/ (so it's not necessary) and ship packge-lock.json (so that
# node_modules/ can be reconstructed if necessary)
$(TARFILE): NODE_ENV=production
$(TARFILE): $(VITE_TEST) cockpit-$(PACKAGE_NAME).spec
	if type appstream-util >/dev/null 2>&1; then appstream-util validate-relax --nonet *.metainfo.xml; fi
	mv node_modules node_modules.release
	touch -r package.json $(NODE_MODULES_TEST)
	touch dist/*
	tar czf cockpit-$(PACKAGE_NAME)-$(VERSION).tar.gz --transform 's,^,cockpit-$(PACKAGE_NAME)/,' \
		--exclude cockpit-$(PACKAGE_NAME).spec.in \
		$$(git ls-files) package-lock.json cockpit-$(PACKAGE_NAME).spec dist/
	mv node_modules.release node_modules

srpm: $(TARFILE) cockpit-$(PACKAGE_NAME).spec
	rpmbuild -bs \
	  --define "_sourcedir `pwd`" \
	  --define "_srcrpmdir `pwd`" \
	  cockpit-$(PACKAGE_NAME).spec

rpm: $(RPMFILE)

$(RPMFILE): $(TARFILE) cockpit-$(PACKAGE_NAME).spec
	mkdir -p "`pwd`/output"
	mkdir -p "`pwd`/rpmbuild"
	rpmbuild -bb \
	  --define "_sourcedir `pwd`" \
	  --define "_specdir `pwd`" \
	  --define "_builddir `pwd`/rpmbuild" \
	  --define "_srcrpmdir `pwd`" \
	  --define "_rpmdir `pwd`/output" \
	  --define "_buildrootdir `pwd`/build" \
	  cockpit-$(PACKAGE_NAME).spec
	find `pwd`/output -name '*.rpm' -printf '%f\n' -exec mv {} . \;
	rm -r "`pwd`/rpmbuild"
	rm -r "`pwd`/output" "`pwd`/build"
	# sanity check
	test -e "$(RPMFILE)"

# build a VM with locally built rpm installed
$(VM_IMAGE): $(RPMFILE) bots
	rm -f $(VM_IMAGE) $(VM_IMAGE).qcow2
	bots/image-customize -v -i cockpit-ws -i `pwd`/$(RPMFILE) -s $(CURDIR)/test/vm.install $(TEST_OS)

# convenience target for the above
vm: $(VM_IMAGE)
	echo $(VM_IMAGE)

# run the browser integration tests; skip check for SELinux denials
# this will run all tests/check-* and format them as TAP
check: $(NODE_MODULES_TEST) $(VM_IMAGE) test/common
	TEST_AUDIT_NO_SELINUX=1 test/common/run-tests

# checkout Cockpit's bots for standard test VM images and API to launch them
# must be from master, as only that has current and existing images; but testvm.py API is stable
# support CI testing against a bots change
bots:
	git clone --quiet --reference-if-able $${XDG_CACHE_HOME:-$$HOME/.cache}/cockpit-project/bots https://github.com/cockpit-project/bots.git
	if [ -n "$$COCKPIT_BOTS_REF" ]; then git -C bots fetch --quiet --depth=1 origin "$$COCKPIT_BOTS_REF"; git -C bots checkout --quiet FETCH_HEAD; fi
	@echo "checked out bots/ ref $$(git -C bots rev-parse HEAD)"

# checkout Cockpit's test API; this has no API stability guarantee, so check out a stable tag
# when you start a new project, use the latest release, and update it from time to time
test/common:
	git fetch --depth=1 https://github.com/cockpit-project/cockpit.git 220
	git checkout --force FETCH_HEAD -- test/common
	git reset test/common

$(NODE_MODULES_TEST): package.json
	# if it exists already, npm install won't update it; force that so that we always get up-to-date packages
	rm -f package-lock.json
	# unset NODE_ENV, skips devDependencies otherwise
	env -u NODE_ENV npm install
	env -u NODE_ENV npm prune

.PHONY: all clean install devel-install dist-gzip srpm rpm check vm update-po
