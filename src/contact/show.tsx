import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Eye,
  Mail,
  Phone,
  Building2,
  Calendar,
  FileText,
  Contact as ContactIcon
} from 'lucide-react'
import { ContactAPI } from '@/services/contact-api'
import type { SambaContact } from '@/types/samba'

interface ShowContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
}

export function ShowContactDialog ({
  isOpen,
  onClose,
  contactName
}: ShowContactDialogProps) {
  const [contact, setContact] = useState<SambaContact | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && contactName) {
      fetchContactDetails()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contactName])

  const fetchContactDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ContactAPI.show(contactName)
      setContact(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact details')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setContact(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Contact Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this contact object.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchContactDetails}
                  className="ml-2"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {loading
            ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
              )
            : contact
              ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ContactIcon className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                      <p className="font-medium">{contact.displayName || contact.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Distinguished Name</label>
                      <p className="text-sm font-mono break-all">{contact.distinguishedName}</p>
                    </div>
                  </div>

                  {(contact.givenName || contact.surname) && (
                    <div className="grid grid-cols-2 gap-4">
                      {contact.givenName && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Given Name</label>
                          <p>{contact.givenName}</p>
                        </div>
                      )}
                      {contact.surname && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Surname</label>
                          <p>{contact.surname}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {contact.initials && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Initials</label>
                      <p>{contact.initials}</p>
                    </div>
                  )}

                  {contact.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-sm">{contact.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contact.mail
                    ? (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                        <p>{contact.mail}</p>
                      </div>
                    </div>
                      )
                    : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">No email address configured</span>
                    </div>
                      )}

                  {contact.telephoneNumber
                    ? (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <p>{contact.telephoneNumber}</p>
                      </div>
                    </div>
                      )
                    : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">No phone number configured</span>
                    </div>
                      )}
                </CardContent>
              </Card>

              {/* Organizational Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Organizational Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Organizational Unit</label>
                    <p className="text-sm font-mono">
                      {contact.organizationalUnit || 'Default (Users container)'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{contact.createdAt.toLocaleDateString()} {contact.createdAt.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Object Type</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Contact Object</Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Internal Name</label>
                    <p className="text-sm font-mono">{contact.name}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
                )
              : (
                  !error && (
                <div className="text-center py-8">
                  <ContactIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No contact selected</p>
                </div>
                  )
                )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
