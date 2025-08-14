import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/lib/providers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Search,
  UserPlus,
  Users,
  Mail,
  Phone,
  Contact as ContactIcon
} from 'lucide-react'
import { BackButton } from '../common'
import { ContactList } from './list'
import { CreateContactDialog } from './create'
import { DeleteContactDialog } from './delete'
import { MoveContactDialog } from './move'
import { ShowContactDialog } from './show'
import { useContacts } from './hooks/useContacts'
import type { FilterOptions } from '@/types/samba'

interface ContactManagementPageProps {
  initialView?: 'list' | 'create';
}

export default function ContactManagementPage ({ initialView = 'list' }: ContactManagementPageProps) {
  const [activeTab, setActiveTab] = useState(initialView)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})

  // Contact management dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [showDialogOpen, setShowDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<string>('')

  const { contacts, loading, error, refresh: refreshContacts } = useContacts({
    filters: { ...filters, search: searchQuery },
    autoFetch: true
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters(prev => ({ ...prev, search: query }))
  }

  const handleCreateSuccess = () => {
    refreshContacts()
    setCreateDialogOpen(false)
  }

  const handleDeleteSuccess = () => {
    refreshContacts()
    setDeleteDialogOpen(false)
    setSelectedContact('')
  }

  const handleMoveSuccess = () => {
    refreshContacts()
    setMoveDialogOpen(false)
    setSelectedContact('')
  }

  const contactStats = {
    total: contacts.length,
    withEmail: contacts.filter(c => c.mail).length,
    withPhone: contacts.filter(c => c.telephoneNumber).length
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Management</h1>
          <p className="text-muted-foreground">
            Manage contact objects and address book entries in Active Directory
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <ContactIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Active directory contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats.withEmail}</div>
            <p className="text-xs text-muted-foreground">
              Contacts with email addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Phone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats.withPhone}</div>
            <p className="text-xs text-muted-foreground">
              Contacts with phone numbers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'create')} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contact List
            </TabsTrigger>
          </TabsList>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create Contact
            </Button>
          </div>
        </div>

        <TabsContent value="list">
          <ContactList
            contacts={contacts}
            loading={loading}
            error={error}
            onRefresh={refreshContacts}
            onShowContact={(contactName) => {
              setSelectedContact(contactName)
              setShowDialogOpen(true)
            }}
            onDeleteContact={(contactName) => {
              setSelectedContact(contactName)
              setDeleteDialogOpen(true)
            }}
            onMoveContact={(contactName) => {
              setSelectedContact(contactName)
              setMoveDialogOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateContactDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onContactCreated={handleCreateSuccess}
      />

      <DeleteContactDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onContactDeleted={handleDeleteSuccess}
        contactName={selectedContact}
      />

      <MoveContactDialog
        isOpen={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        onContactMoved={handleMoveSuccess}
        contactName={selectedContact}
      />

      <ShowContactDialog
        isOpen={showDialogOpen}
        onClose={() => setShowDialogOpen(false)}
        contactName={selectedContact}
      />
    </div>
  )
}

// Entry point for standalone Contact management page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('contact')
  if (container) {
    const root = createRoot(container)
    root.render(
      <Providers>
        <ContactManagementPage />
      </Providers>
    )
  }
})
