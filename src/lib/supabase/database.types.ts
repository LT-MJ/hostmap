export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      ActivityLog: {
        Row: {
          action: string
          createdAt: string
          entityId: string | null
          entityType: string
          field: string | null
          id: string
          newValue: string | null
          oldValue: string | null
          userId: string | null
        }
        Insert: {
          action: string
          createdAt?: string
          entityId?: string | null
          entityType: string
          field?: string | null
          id: string
          newValue?: string | null
          oldValue?: string | null
          userId?: string | null
        }
        Update: {
          action?: string
          createdAt?: string
          entityId?: string | null
          entityType?: string
          field?: string | null
          id?: string
          newValue?: string | null
          oldValue?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ActivityLog_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actorId: string | null
          actorLabel: string | null
          actorType: Database["public"]["Enums"]["AuditActorType"]
          afterState: Json | null
          beforeState: Json | null
          createdAt: string
          entityId: string
          entityType: Database["public"]["Enums"]["AuditEntityType"]
          id: string
          ip: string | null
          metadata: Json | null
          reason: string | null
          requestId: string | null
          tenantId: string
          userAgent: string | null
        }
        Insert: {
          action: string
          actorId?: string | null
          actorLabel?: string | null
          actorType: Database["public"]["Enums"]["AuditActorType"]
          afterState?: Json | null
          beforeState?: Json | null
          createdAt?: string
          entityId: string
          entityType: Database["public"]["Enums"]["AuditEntityType"]
          id: string
          ip?: string | null
          metadata?: Json | null
          reason?: string | null
          requestId?: string | null
          tenantId: string
          userAgent?: string | null
        }
        Update: {
          action?: string
          actorId?: string | null
          actorLabel?: string | null
          actorType?: Database["public"]["Enums"]["AuditActorType"]
          afterState?: Json | null
          beforeState?: Json | null
          createdAt?: string
          entityId?: string
          entityType?: Database["public"]["Enums"]["AuditEntityType"]
          id?: string
          ip?: string | null
          metadata?: Json | null
          reason?: string | null
          requestId?: string | null
          tenantId?: string
          userAgent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      BackgroundJob: {
        Row: {
          createdAt: string
          errorMessage: string | null
          finishedAt: string | null
          id: string
          initiatedBy: string | null
          result: string | null
          startedAt: string | null
          status: string
          type: string
        }
        Insert: {
          createdAt?: string
          errorMessage?: string | null
          finishedAt?: string | null
          id: string
          initiatedBy?: string | null
          result?: string | null
          startedAt?: string | null
          status?: string
          type: string
        }
        Update: {
          createdAt?: string
          errorMessage?: string | null
          finishedAt?: string | null
          id?: string
          initiatedBy?: string | null
          result?: string | null
          startedAt?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      BlogAuthor: {
        Row: {
          bio: string | null
          email: string | null
          id: string
          name: string
          profileImage: string | null
          slug: string
          socialProfiles: string | null
          userId: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          email?: string | null
          id: string
          name: string
          profileImage?: string | null
          slug: string
          socialProfiles?: string | null
          userId?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          email?: string | null
          id?: string
          name?: string
          profileImage?: string | null
          slug?: string
          socialProfiles?: string | null
          userId?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "BlogAuthor_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      BlogCategory: {
        Row: {
          description: string | null
          featuredImage: string | null
          id: string
          name: string
          parentId: string | null
          slug: string
        }
        Insert: {
          description?: string | null
          featuredImage?: string | null
          id: string
          name: string
          parentId?: string | null
          slug: string
        }
        Update: {
          description?: string | null
          featuredImage?: string | null
          id?: string
          name?: string
          parentId?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "BlogCategory_parentId_fkey"
            columns: ["parentId"]
            isOneToOne: false
            referencedRelation: "BlogCategory"
            referencedColumns: ["id"]
          },
        ]
      }
      BlogComment: {
        Row: {
          authorEmail: string | null
          authorName: string
          content: string
          createdAt: string
          id: string
          postId: string
          status: string
        }
        Insert: {
          authorEmail?: string | null
          authorName: string
          content: string
          createdAt?: string
          id: string
          postId: string
          status?: string
        }
        Update: {
          authorEmail?: string | null
          authorName?: string
          content?: string
          createdAt?: string
          id?: string
          postId?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "BlogComment_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "BlogPost"
            referencedColumns: ["id"]
          },
        ]
      }
      BlogPost: {
        Row: {
          authorId: string | null
          categoryId: string | null
          commentsEnabled: boolean
          content: string
          createdAt: string
          excerpt: string | null
          featured: boolean
          featuredImage: string | null
          gallery: string | null
          id: string
          publishedAt: string | null
          readingTimeMinutes: number | null
          scheduledAt: string | null
          slug: string
          status: string
          title: string
          updatedAt: string
          viewCount: number
          visibility: string
        }
        Insert: {
          authorId?: string | null
          categoryId?: string | null
          commentsEnabled?: boolean
          content?: string
          createdAt?: string
          excerpt?: string | null
          featured?: boolean
          featuredImage?: string | null
          gallery?: string | null
          id: string
          publishedAt?: string | null
          readingTimeMinutes?: number | null
          scheduledAt?: string | null
          slug: string
          status?: string
          title: string
          updatedAt: string
          viewCount?: number
          visibility?: string
        }
        Update: {
          authorId?: string | null
          categoryId?: string | null
          commentsEnabled?: boolean
          content?: string
          createdAt?: string
          excerpt?: string | null
          featured?: boolean
          featuredImage?: string | null
          gallery?: string | null
          id?: string
          publishedAt?: string | null
          readingTimeMinutes?: number | null
          scheduledAt?: string | null
          slug?: string
          status?: string
          title?: string
          updatedAt?: string
          viewCount?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "BlogPost_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "BlogAuthor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BlogPost_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "BlogCategory"
            referencedColumns: ["id"]
          },
        ]
      }
      BlogPostRelation: {
        Row: {
          id: string
          manual: boolean
          relatedPostId: string
          sourcePostId: string
        }
        Insert: {
          id: string
          manual?: boolean
          relatedPostId: string
          sourcePostId: string
        }
        Update: {
          id?: string
          manual?: boolean
          relatedPostId?: string
          sourcePostId?: string
        }
        Relationships: [
          {
            foreignKeyName: "BlogPostRelation_relatedPostId_fkey"
            columns: ["relatedPostId"]
            isOneToOne: false
            referencedRelation: "BlogPost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BlogPostRelation_sourcePostId_fkey"
            columns: ["sourcePostId"]
            isOneToOne: false
            referencedRelation: "BlogPost"
            referencedColumns: ["id"]
          },
        ]
      }
      BlogPostRevision: {
        Row: {
          authorId: string | null
          changedFields: string | null
          createdAt: string
          id: string
          postId: string
          snapshot: string
        }
        Insert: {
          authorId?: string | null
          changedFields?: string | null
          createdAt?: string
          id: string
          postId: string
          snapshot: string
        }
        Update: {
          authorId?: string | null
          changedFields?: string | null
          createdAt?: string
          id?: string
          postId?: string
          snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "BlogPostRevision_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "BlogPost"
            referencedColumns: ["id"]
          },
        ]
      }
      BlogPostTag: {
        Row: {
          postId: string
          tagId: string
        }
        Insert: {
          postId: string
          tagId: string
        }
        Update: {
          postId?: string
          tagId?: string
        }
        Relationships: [
          {
            foreignKeyName: "BlogPostTag_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "BlogPost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BlogPostTag_tagId_fkey"
            columns: ["tagId"]
            isOneToOne: false
            referencedRelation: "BlogTag"
            referencedColumns: ["id"]
          },
        ]
      }
      BlogTag: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id: string
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      BreadcrumbSettings: {
        Row: {
          enabled: boolean
          homeLabel: string
          homeUrl: string
          id: string
          notFoundLabel: string
          separator: string
          updatedAt: string
        }
        Insert: {
          enabled?: boolean
          homeLabel?: string
          homeUrl?: string
          id?: string
          notFoundLabel?: string
          separator?: string
          updatedAt: string
        }
        Update: {
          enabled?: boolean
          homeLabel?: string
          homeUrl?: string
          id?: string
          notFoundLabel?: string
          separator?: string
          updatedAt?: string
        }
        Relationships: []
      }
      client_contacts: {
        Row: {
          clientId: string
          createdAt: string
          deletedAt: string | null
          email: string
          emailVerifiedAt: string | null
          firstName: string
          id: string
          isPrimary: boolean
          lastLoginAt: string | null
          lastLoginIp: string | null
          lastName: string
          lockedUntil: string | null
          passwordHash: string
          permBilling: boolean
          permDomains: boolean
          permServices: boolean
          permSupport: boolean
          recoveryCodeHashes: Json | null
          status: Database["public"]["Enums"]["ClientContactStatus"]
          tenantId: string
          twoFactorEnabled: boolean
          twoFactorSecret: string | null
          updatedAt: string
        }
        Insert: {
          clientId: string
          createdAt?: string
          deletedAt?: string | null
          email: string
          emailVerifiedAt?: string | null
          firstName: string
          id: string
          isPrimary?: boolean
          lastLoginAt?: string | null
          lastLoginIp?: string | null
          lastName: string
          lockedUntil?: string | null
          passwordHash: string
          permBilling?: boolean
          permDomains?: boolean
          permServices?: boolean
          permSupport?: boolean
          recoveryCodeHashes?: Json | null
          status?: Database["public"]["Enums"]["ClientContactStatus"]
          tenantId: string
          twoFactorEnabled?: boolean
          twoFactorSecret?: string | null
          updatedAt: string
        }
        Update: {
          clientId?: string
          createdAt?: string
          deletedAt?: string | null
          email?: string
          emailVerifiedAt?: string | null
          firstName?: string
          id?: string
          isPrimary?: boolean
          lastLoginAt?: string | null
          lastLoginIp?: string | null
          lastName?: string
          lockedUntil?: string | null
          passwordHash?: string
          permBilling?: boolean
          permDomains?: boolean
          permServices?: boolean
          permSupport?: boolean
          recoveryCodeHashes?: Json | null
          status?: Database["public"]["Enums"]["ClientContactStatus"]
          tenantId?: string
          twoFactorEnabled?: boolean
          twoFactorSecret?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_clientId_fkey"
            columns: ["clientId"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_groups: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          isDefault: boolean
          name: string
          tenantId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          isDefault?: boolean
          name: string
          tenantId: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          isDefault?: boolean
          name?: string
          tenantId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_groups_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          authorLabel: string
          authorStaffUserId: string | null
          body: string
          clientId: string
          createdAt: string
          id: string
          tenantId: string
        }
        Insert: {
          authorLabel: string
          authorStaffUserId?: string | null
          body: string
          clientId: string
          createdAt?: string
          id: string
          tenantId: string
        }
        Update: {
          authorLabel?: string
          authorStaffUserId?: string | null
          body?: string
          clientId?: string
          createdAt?: string
          id?: string
          tenantId?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_clientId_fkey"
            columns: ["clientId"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_sessions: {
        Row: {
          contactId: string
          createdAt: string
          expiresAt: string
          id: string
          impersonatedByStaffUserId: string | null
          impersonationReason: string | null
          ip: string | null
          lastSeenAt: string
          revokedAt: string | null
          revokedReason: string | null
          tenantId: string
          tokenHash: string
          userAgent: string | null
        }
        Insert: {
          contactId: string
          createdAt?: string
          expiresAt: string
          id: string
          impersonatedByStaffUserId?: string | null
          impersonationReason?: string | null
          ip?: string | null
          lastSeenAt?: string
          revokedAt?: string | null
          revokedReason?: string | null
          tenantId: string
          tokenHash: string
          userAgent?: string | null
        }
        Update: {
          contactId?: string
          createdAt?: string
          expiresAt?: string
          id?: string
          impersonatedByStaffUserId?: string | null
          impersonationReason?: string | null
          ip?: string | null
          lastSeenAt?: string
          revokedAt?: string | null
          revokedReason?: string | null
          tenantId?: string
          tokenHash?: string
          userAgent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_sessions_contactId_fkey"
            columns: ["contactId"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sessions_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          addressLine1: string | null
          addressLine2: string | null
          city: string | null
          clientGroupId: string | null
          companyName: string | null
          country: string | null
          createdAt: string
          creditBalance: number
          currency: string
          email: string
          firstName: string
          id: string
          language: string
          lastLoginAt: string | null
          lastName: string
          phone: string | null
          postalCode: string | null
          riskStatus: Database["public"]["Enums"]["RiskStatus"]
          state: string | null
          status: Database["public"]["Enums"]["ClientStatus"]
          taxId: string | null
          tenantId: string
          timezone: string
          type: Database["public"]["Enums"]["ClientType"]
          updatedAt: string
          verificationStatus: Database["public"]["Enums"]["VerificationStatus"]
        }
        Insert: {
          addressLine1?: string | null
          addressLine2?: string | null
          city?: string | null
          clientGroupId?: string | null
          companyName?: string | null
          country?: string | null
          createdAt?: string
          creditBalance?: number
          currency?: string
          email: string
          firstName: string
          id: string
          language?: string
          lastLoginAt?: string | null
          lastName: string
          phone?: string | null
          postalCode?: string | null
          riskStatus?: Database["public"]["Enums"]["RiskStatus"]
          state?: string | null
          status?: Database["public"]["Enums"]["ClientStatus"]
          taxId?: string | null
          tenantId: string
          timezone?: string
          type?: Database["public"]["Enums"]["ClientType"]
          updatedAt: string
          verificationStatus?: Database["public"]["Enums"]["VerificationStatus"]
        }
        Update: {
          addressLine1?: string | null
          addressLine2?: string | null
          city?: string | null
          clientGroupId?: string | null
          companyName?: string | null
          country?: string | null
          createdAt?: string
          creditBalance?: number
          currency?: string
          email?: string
          firstName?: string
          id?: string
          language?: string
          lastLoginAt?: string | null
          lastName?: string
          phone?: string | null
          postalCode?: string | null
          riskStatus?: Database["public"]["Enums"]["RiskStatus"]
          state?: string | null
          status?: Database["public"]["Enums"]["ClientStatus"]
          taxId?: string | null
          tenantId?: string
          timezone?: string
          type?: Database["public"]["Enums"]["ClientType"]
          updatedAt?: string
          verificationStatus?: Database["public"]["Enums"]["VerificationStatus"]
        }
        Relationships: [
          {
            foreignKeyName: "clients_clientGroupId_fkey"
            columns: ["clientGroupId"]
            isOneToOne: false
            referencedRelation: "client_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      Collection: {
        Row: {
          description: string | null
          id: string
          image: string | null
          name: string
          rules: string | null
          slug: string
          type: string
        }
        Insert: {
          description?: string | null
          id: string
          image?: string | null
          name: string
          rules?: string | null
          slug: string
          type?: string
        }
        Update: {
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          rules?: string | null
          slug?: string
          type?: string
        }
        Relationships: []
      }
      CollectionProduct: {
        Row: {
          collectionId: string
          position: number
          productId: string
        }
        Insert: {
          collectionId: string
          position?: number
          productId: string
        }
        Update: {
          collectionId?: string
          position?: number
          productId?: string
        }
        Relationships: [
          {
            foreignKeyName: "CollectionProduct_collectionId_fkey"
            columns: ["collectionId"]
            isOneToOne: false
            referencedRelation: "Collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CollectionProduct_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      counters: {
        Row: {
          key: string
          tenantId: string
          value: number
        }
        Insert: {
          key: string
          tenantId: string
          value?: number
        }
        Update: {
          key?: string
          tenantId?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "counters_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      Coupon: {
        Row: {
          active: boolean
          categoryRestrictions: string | null
          code: string
          createdAt: string
          endsAt: string | null
          id: string
          maxDiscount: number | null
          minPurchase: number | null
          perCustomerLimit: number | null
          productRestrictions: string | null
          startsAt: string | null
          type: string
          usageLimit: number | null
          usedCount: number
          value: number
        }
        Insert: {
          active?: boolean
          categoryRestrictions?: string | null
          code: string
          createdAt?: string
          endsAt?: string | null
          id: string
          maxDiscount?: number | null
          minPurchase?: number | null
          perCustomerLimit?: number | null
          productRestrictions?: string | null
          startsAt?: string | null
          type: string
          usageLimit?: number | null
          usedCount?: number
          value: number
        }
        Update: {
          active?: boolean
          categoryRestrictions?: string | null
          code?: string
          createdAt?: string
          endsAt?: string | null
          id?: string
          maxDiscount?: number | null
          minPurchase?: number | null
          perCustomerLimit?: number | null
          productRestrictions?: string | null
          startsAt?: string | null
          type?: string
          usageLimit?: number | null
          usedCount?: number
          value?: number
        }
        Relationships: []
      }
      Customer: {
        Row: {
          address: string | null
          createdAt: string
          email: string
          id: string
          lastOrderAt: string | null
          name: string | null
          ordersCount: number
          phone: string | null
          totalSpent: number
        }
        Insert: {
          address?: string | null
          createdAt?: string
          email: string
          id: string
          lastOrderAt?: string | null
          name?: string | null
          ordersCount?: number
          phone?: string | null
          totalSpent?: number
        }
        Update: {
          address?: string | null
          createdAt?: string
          email?: string
          id?: string
          lastOrderAt?: string | null
          name?: string | null
          ordersCount?: number
          phone?: string | null
          totalSpent?: number
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          attempts: number
          createdAt: string
          error: string | null
          id: string
          providerMessageId: string | null
          relatedEntityId: string | null
          relatedEntityType: string | null
          sentAt: string | null
          status: Database["public"]["Enums"]["EmailStatus"]
          subject: string
          templateKey: string
          tenantId: string
          toEmail: string
        }
        Insert: {
          attempts?: number
          createdAt?: string
          error?: string | null
          id: string
          providerMessageId?: string | null
          relatedEntityId?: string | null
          relatedEntityType?: string | null
          sentAt?: string | null
          status?: Database["public"]["Enums"]["EmailStatus"]
          subject: string
          templateKey: string
          tenantId: string
          toEmail: string
        }
        Update: {
          attempts?: number
          createdAt?: string
          error?: string | null
          id?: string
          providerMessageId?: string | null
          relatedEntityId?: string | null
          relatedEntityType?: string | null
          sentAt?: string | null
          status?: Database["public"]["Enums"]["EmailStatus"]
          subject?: string
          templateKey?: string
          tenantId?: string
          toEmail?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verification_tokens: {
        Row: {
          actorId: string
          actorType: Database["public"]["Enums"]["AuthActorType"]
          consumedAt: string | null
          createdAt: string
          email: string
          expiresAt: string
          id: string
          tenantId: string
          tokenHash: string
        }
        Insert: {
          actorId: string
          actorType: Database["public"]["Enums"]["AuthActorType"]
          consumedAt?: string | null
          createdAt?: string
          email: string
          expiresAt: string
          id: string
          tenantId: string
          tokenHash: string
        }
        Update: {
          actorId?: string
          actorType?: Database["public"]["Enums"]["AuthActorType"]
          consumedAt?: string | null
          createdAt?: string
          email?: string
          expiresAt?: string
          id?: string
          tenantId?: string
          tokenHash?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_tokens_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      HeaderFooterSettings: {
        Row: {
          copyrightText: string
          footerColumns: string | null
          headerLayout: string
          headerSticky: boolean
          id: string
          logoAltText: string | null
          logoImageUrl: string | null
          logoText: string | null
          primaryMenuId: string | null
          socialLinks: string | null
          updatedAt: string
        }
        Insert: {
          copyrightText?: string
          footerColumns?: string | null
          headerLayout?: string
          headerSticky?: boolean
          id?: string
          logoAltText?: string | null
          logoImageUrl?: string | null
          logoText?: string | null
          primaryMenuId?: string | null
          socialLinks?: string | null
          updatedAt: string
        }
        Update: {
          copyrightText?: string
          footerColumns?: string | null
          headerLayout?: string
          headerSticky?: boolean
          id?: string
          logoAltText?: string | null
          logoImageUrl?: string | null
          logoText?: string | null
          primaryMenuId?: string | null
          socialLinks?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "HeaderFooterSettings_primaryMenuId_fkey"
            columns: ["primaryMenuId"]
            isOneToOne: false
            referencedRelation: "Menu"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: []
      }
      hostmap_block_definitions: {
        Row: {
          category: string
          created_at: string
          key: string
          label: string
          requires_permission: string | null
        }
        Insert: {
          category: string
          created_at?: string
          key: string
          label: string
          requires_permission?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          key?: string
          label?: string
          requires_permission?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_block_definitions_requires_permission_fkey"
            columns: ["requires_permission"]
            isOneToOne: false
            referencedRelation: "hostmap_permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      hostmap_blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      hostmap_blog_post_blocks: {
        Row: {
          block_type: string
          config: Json
          created_at: string
          id: string
          is_hidden: boolean
          position: number
          post_id: string
          updated_at: string
        }
        Insert: {
          block_type: string
          config?: Json
          created_at?: string
          id?: string
          is_hidden?: boolean
          position: number
          post_id: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          config?: Json
          created_at?: string
          id?: string
          is_hidden?: boolean
          position?: number
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_blog_post_blocks_block_type_fkey"
            columns: ["block_type"]
            isOneToOne: false
            referencedRelation: "hostmap_block_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hostmap_blog_post_blocks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "hostmap_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_blog_post_revisions: {
        Row: {
          author_id: string | null
          blocks_snapshot: Json
          change_note: string | null
          created_at: string
          id: string
          post_id: string
          revision_number: number
          seo_snapshot: Json
          title: string
        }
        Insert: {
          author_id?: string | null
          blocks_snapshot: Json
          change_note?: string | null
          created_at?: string
          id?: string
          post_id: string
          revision_number: number
          seo_snapshot?: Json
          title: string
        }
        Update: {
          author_id?: string | null
          blocks_snapshot?: Json
          change_note?: string | null
          created_at?: string
          id?: string
          post_id?: string
          revision_number?: number
          seo_snapshot?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_blog_post_revisions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "hostmap_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "hostmap_blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "hostmap_blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_blog_posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category_id: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string | null
          featured_media_id: string | null
          id: string
          meta_description: string | null
          og_description: string | null
          og_image_media_id: string | null
          og_title: string | null
          published_at: string | null
          published_revision_id: string | null
          reading_time_minutes: number | null
          robots_directive: string | null
          scheduled_at: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["hostmap_content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          featured_media_id?: string | null
          id?: string
          meta_description?: string | null
          og_description?: string | null
          og_image_media_id?: string | null
          og_title?: string | null
          published_at?: string | null
          published_revision_id?: string | null
          reading_time_minutes?: number | null
          robots_directive?: string | null
          scheduled_at?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["hostmap_content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          featured_media_id?: string | null
          id?: string
          meta_description?: string | null
          og_description?: string | null
          og_image_media_id?: string | null
          og_title?: string | null
          published_at?: string | null
          published_revision_id?: string | null
          reading_time_minutes?: number | null
          robots_directive?: string | null
          scheduled_at?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["hostmap_content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "hostmap_blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_blog_posts_featured_media_id_fkey"
            columns: ["featured_media_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_blog_posts_og_image_media_id_fkey"
            columns: ["og_image_media_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_blog_posts_published_revision_id_fkey"
            columns: ["published_revision_id"]
            isOneToOne: false
            referencedRelation: "hostmap_blog_post_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_blog_tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      hostmap_media: {
        Row: {
          alt_text: string | null
          bucket: string
          caption: string | null
          created_at: string
          description: string | null
          folder_id: string | null
          height: number | null
          id: string
          mime_type: string
          size_bytes: number
          storage_path: string
          title: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket?: string
          caption?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type: string
          size_bytes: number
          storage_path: string
          title?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket?: string
          caption?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          title?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_media_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_media_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_navigation_items: {
        Row: {
          created_at: string
          id: string
          label: string
          menu_id: string
          open_in_new_tab: boolean
          page_id: string | null
          parent_id: string | null
          position: number
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          menu_id: string
          open_in_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          position?: number
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          menu_id?: string
          open_in_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          position?: number
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_navigation_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "hostmap_navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_navigation_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "hostmap_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "hostmap_navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_navigation_menus: {
        Row: {
          id: string
          key: string
          name: string
        }
        Insert: {
          id?: string
          key: string
          name: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      hostmap_not_found_log: {
        Row: {
          created_at: string
          hit_count: number
          id: string
          last_seen_at: string
          referrer: string | null
          url: string
        }
        Insert: {
          created_at?: string
          hit_count?: number
          id?: string
          last_seen_at?: string
          referrer?: string | null
          url: string
        }
        Update: {
          created_at?: string
          hit_count?: number
          id?: string
          last_seen_at?: string
          referrer?: string | null
          url?: string
        }
        Relationships: []
      }
      hostmap_page_blocks: {
        Row: {
          block_type: string
          config: Json
          created_at: string
          id: string
          is_hidden: boolean
          page_id: string
          position: number
          updated_at: string
          visibility: Json
        }
        Insert: {
          block_type: string
          config?: Json
          created_at?: string
          id?: string
          is_hidden?: boolean
          page_id: string
          position: number
          updated_at?: string
          visibility?: Json
        }
        Update: {
          block_type?: string
          config?: Json
          created_at?: string
          id?: string
          is_hidden?: boolean
          page_id?: string
          position?: number
          updated_at?: string
          visibility?: Json
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_page_blocks_block_type_fkey"
            columns: ["block_type"]
            isOneToOne: false
            referencedRelation: "hostmap_block_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hostmap_page_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "hostmap_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_page_revisions: {
        Row: {
          author_id: string | null
          blocks_snapshot: Json
          change_note: string | null
          created_at: string
          id: string
          page_id: string
          revision_number: number
          seo_snapshot: Json
          title: string
        }
        Insert: {
          author_id?: string | null
          blocks_snapshot: Json
          change_note?: string | null
          created_at?: string
          id?: string
          page_id: string
          revision_number: number
          seo_snapshot?: Json
          title: string
        }
        Update: {
          author_id?: string | null
          blocks_snapshot?: Json
          change_note?: string | null
          created_at?: string
          id?: string
          page_id?: string
          revision_number?: number
          seo_snapshot?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_page_revisions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "hostmap_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_pages: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          created_at: string
          custom_fields: Json
          deleted_at: string | null
          excerpt: string | null
          featured_media_id: string | null
          id: string
          meta_description: string | null
          og_description: string | null
          og_image_media_id: string | null
          og_title: string | null
          published_at: string | null
          published_revision_id: string | null
          robots_directive: string | null
          scheduled_at: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["hostmap_content_status"]
          template: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          created_at?: string
          custom_fields?: Json
          deleted_at?: string | null
          excerpt?: string | null
          featured_media_id?: string | null
          id?: string
          meta_description?: string | null
          og_description?: string | null
          og_image_media_id?: string | null
          og_title?: string | null
          published_at?: string | null
          published_revision_id?: string | null
          robots_directive?: string | null
          scheduled_at?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["hostmap_content_status"]
          template?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          created_at?: string
          custom_fields?: Json
          deleted_at?: string | null
          excerpt?: string | null
          featured_media_id?: string | null
          id?: string
          meta_description?: string | null
          og_description?: string | null
          og_image_media_id?: string | null
          og_title?: string | null
          published_at?: string | null
          published_revision_id?: string | null
          robots_directive?: string | null
          scheduled_at?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["hostmap_content_status"]
          template?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_pages_featured_media_id_fkey"
            columns: ["featured_media_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_pages_og_image_media_id_fkey"
            columns: ["og_image_media_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_pages_published_revision_id_fkey"
            columns: ["published_revision_id"]
            isOneToOne: false
            referencedRelation: "hostmap_page_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      hostmap_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_type: Database["public"]["Enums"]["hostmap_user_type"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["hostmap_user_type"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["hostmap_user_type"]
        }
        Relationships: []
      }
      hostmap_redirects: {
        Row: {
          created_at: string
          created_by: string | null
          destination_path: string
          hit_count: number
          id: string
          is_active: boolean
          source_path: string
          status_code: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination_path: string
          hit_count?: number
          id?: string
          is_active?: boolean
          source_path: string
          status_code?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination_path?: string
          hit_count?: number
          id?: string
          is_active?: boolean
          source_path?: string
          status_code?: number
        }
        Relationships: []
      }
      hostmap_role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "hostmap_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "hostmap_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: string
          name?: string
        }
        Relationships: []
      }
      hostmap_site_settings: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          default_currency: string
          favicon_media_id: string | null
          id: number
          logo_dark_media_id: string | null
          logo_media_id: string | null
          robots_default: string
          seo_title_separator: string
          site_name: string
          tagline: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          default_currency?: string
          favicon_media_id?: string | null
          id?: number
          logo_dark_media_id?: string | null
          logo_media_id?: string | null
          robots_default?: string
          seo_title_separator?: string
          site_name?: string
          tagline?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          default_currency?: string
          favicon_media_id?: string | null
          id?: number
          logo_dark_media_id?: string | null
          logo_media_id?: string | null
          robots_default?: string
          seo_title_separator?: string
          site_name?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_site_settings_favicon_media_id_fkey"
            columns: ["favicon_media_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_site_settings_logo_dark_media_id_fkey"
            columns: ["logo_dark_media_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostmap_site_settings_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "hostmap_media"
            referencedColumns: ["id"]
          },
        ]
      }
      hostmap_theme_settings: {
        Row: {
          dark_mode_enabled: boolean
          id: number
          tokens: Json
          updated_at: string
        }
        Insert: {
          dark_mode_enabled?: boolean
          id?: number
          tokens?: Json
          updated_at?: string
        }
        Update: {
          dark_mode_enabled?: boolean
          id?: number
          tokens?: Json
          updated_at?: string
        }
        Relationships: []
      }
      hostmap_user_roles: {
        Row: {
          created_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostmap_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "hostmap_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      IndexingQueueItem: {
        Row: {
          action: string
          createdAt: string
          id: string
          processedAt: string | null
          provider: string
          response: string | null
          status: string
          url: string
        }
        Insert: {
          action: string
          createdAt?: string
          id: string
          processedAt?: string | null
          provider: string
          response?: string | null
          status?: string
          url: string
        }
        Update: {
          action?: string
          createdAt?: string
          id?: string
          processedAt?: string | null
          provider?: string
          response?: string | null
          status?: string
          url?: string
        }
        Relationships: []
      }
      InventoryAdjustment: {
        Row: {
          createdAt: string
          delta: number
          id: string
          inventoryItemId: string
          reason: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          delta: number
          id: string
          inventoryItemId: string
          reason: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          delta?: number
          id?: string
          inventoryItemId?: string
          reason?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "InventoryAdjustment_inventoryItemId_fkey"
            columns: ["inventoryItemId"]
            isOneToOne: false
            referencedRelation: "InventoryItem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "InventoryAdjustment_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      InventoryItem: {
        Row: {
          id: string
          productId: string | null
          reorderThreshold: number
          reserved: number
          sku: string
          stock: number
          updatedAt: string
          variantId: string | null
        }
        Insert: {
          id: string
          productId?: string | null
          reorderThreshold?: number
          reserved?: number
          sku: string
          stock?: number
          updatedAt: string
          variantId?: string | null
        }
        Update: {
          id?: string
          productId?: string | null
          reorderThreshold?: number
          reserved?: number
          sku?: string
          stock?: number
          updatedAt?: string
          variantId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "InventoryItem_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "InventoryItem_variantId_fkey"
            columns: ["variantId"]
            isOneToOne: false
            referencedRelation: "ProductVariant"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          createdAt: string
          description: string
          discountAmount: number
          id: string
          invoiceId: string
          lineTotal: number
          quantity: number
          sourceOrderItemId: string | null
          taxAmount: number
          tenantId: string
          unitPrice: number
        }
        Insert: {
          createdAt?: string
          description: string
          discountAmount?: number
          id: string
          invoiceId: string
          lineTotal: number
          quantity?: number
          sourceOrderItemId?: string | null
          taxAmount?: number
          tenantId: string
          unitPrice: number
        }
        Update: {
          createdAt?: string
          description?: string
          discountAmount?: number
          id?: string
          invoiceId?: string
          lineTotal?: number
          quantity?: number
          sourceOrderItemId?: string | null
          taxAmount?: number
          tenantId?: string
          unitPrice?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoiceId_fkey"
            columns: ["invoiceId"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amountDue: number
          amountPaid: number
          clientId: string
          companySnapshot: Json
          createdAt: string
          currency: string
          customerSnapshot: Json
          discountTotal: number
          dueDate: string
          id: string
          invoiceNumber: string
          issuedAt: string | null
          notes: string | null
          orderId: string | null
          paidAt: string | null
          status: Database["public"]["Enums"]["InvoiceStatus"]
          subtotal: number
          taxTotal: number
          tenantId: string
          total: number
          updatedAt: string
        }
        Insert: {
          amountDue: number
          amountPaid?: number
          clientId: string
          companySnapshot: Json
          createdAt?: string
          currency: string
          customerSnapshot: Json
          discountTotal?: number
          dueDate: string
          id: string
          invoiceNumber: string
          issuedAt?: string | null
          notes?: string | null
          orderId?: string | null
          paidAt?: string | null
          status?: Database["public"]["Enums"]["InvoiceStatus"]
          subtotal: number
          taxTotal?: number
          tenantId: string
          total: number
          updatedAt: string
        }
        Update: {
          amountDue?: number
          amountPaid?: number
          clientId?: string
          companySnapshot?: Json
          createdAt?: string
          currency?: string
          customerSnapshot?: Json
          discountTotal?: number
          dueDate?: string
          id?: string
          invoiceNumber?: string
          issuedAt?: string | null
          notes?: string | null
          orderId?: string | null
          paidAt?: string | null
          status?: Database["public"]["Enums"]["InvoiceStatus"]
          subtotal?: number
          taxTotal?: number
          tenantId?: string
          total?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_clientId_fkey"
            columns: ["clientId"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      LocalSeoSettings: {
        Row: {
          businessName: string | null
          businessType: string
          city: string | null
          country: string | null
          email: string | null
          enabled: boolean
          id: string
          latitude: number | null
          logo: string | null
          longitude: number | null
          openingHours: string | null
          phone: string | null
          postalCode: string | null
          priceRange: string | null
          region: string | null
          socialProfiles: string | null
          streetAddress: string | null
          updatedAt: string
          website: string | null
        }
        Insert: {
          businessName?: string | null
          businessType?: string
          city?: string | null
          country?: string | null
          email?: string | null
          enabled?: boolean
          id?: string
          latitude?: number | null
          logo?: string | null
          longitude?: number | null
          openingHours?: string | null
          phone?: string | null
          postalCode?: string | null
          priceRange?: string | null
          region?: string | null
          socialProfiles?: string | null
          streetAddress?: string | null
          updatedAt: string
          website?: string | null
        }
        Update: {
          businessName?: string | null
          businessType?: string
          city?: string | null
          country?: string | null
          email?: string | null
          enabled?: boolean
          id?: string
          latitude?: number | null
          logo?: string | null
          longitude?: number | null
          openingHours?: string | null
          phone?: string | null
          postalCode?: string | null
          priceRange?: string | null
          region?: string | null
          socialProfiles?: string | null
          streetAddress?: string | null
          updatedAt?: string
          website?: string | null
        }
        Relationships: []
      }
      login_events: {
        Row: {
          actorId: string | null
          actorType: Database["public"]["Enums"]["AuthActorType"]
          createdAt: string
          email: string
          id: string
          ip: string | null
          reason: string | null
          success: boolean
          tenantId: string
          userAgent: string | null
        }
        Insert: {
          actorId?: string | null
          actorType: Database["public"]["Enums"]["AuthActorType"]
          createdAt?: string
          email: string
          id: string
          ip?: string | null
          reason?: string | null
          success: boolean
          tenantId: string
          userAgent?: string | null
        }
        Update: {
          actorId?: string | null
          actorType?: Database["public"]["Enums"]["AuthActorType"]
          createdAt?: string
          email?: string
          id?: string
          ip?: string | null
          reason?: string | null
          success?: boolean
          tenantId?: string
          userAgent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_events_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      MediaAsset: {
        Row: {
          alt: string | null
          caption: string | null
          createdAt: string
          description: string | null
          filename: string
          folder: string | null
          height: number | null
          id: string
          mimeType: string
          size: number
          url: string
          width: number | null
        }
        Insert: {
          alt?: string | null
          caption?: string | null
          createdAt?: string
          description?: string | null
          filename: string
          folder?: string | null
          height?: number | null
          id: string
          mimeType: string
          size: number
          url: string
          width?: number | null
        }
        Update: {
          alt?: string | null
          caption?: string | null
          createdAt?: string
          description?: string | null
          filename?: string
          folder?: string | null
          height?: number | null
          id?: string
          mimeType?: string
          size?: number
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      Menu: {
        Row: {
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      MenuItem: {
        Row: {
          createdAt: string
          id: string
          label: string
          linkType: string
          menuId: string
          openInNewTab: boolean
          order: number
          parentId: string | null
          targetId: string | null
          updatedAt: string
          url: string | null
        }
        Insert: {
          createdAt?: string
          id: string
          label: string
          linkType?: string
          menuId: string
          openInNewTab?: boolean
          order?: number
          parentId?: string | null
          targetId?: string | null
          updatedAt: string
          url?: string | null
        }
        Update: {
          createdAt?: string
          id?: string
          label?: string
          linkType?: string
          menuId?: string
          openInNewTab?: boolean
          order?: number
          parentId?: string | null
          targetId?: string | null
          updatedAt?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "MenuItem_menuId_fkey"
            columns: ["menuId"]
            isOneToOne: false
            referencedRelation: "Menu"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MenuItem_parentId_fkey"
            columns: ["parentId"]
            isOneToOne: false
            referencedRelation: "MenuItem"
            referencedColumns: ["id"]
          },
        ]
      }
      NotFoundLog: {
        Row: {
          firstSeenAt: string
          hitCount: number
          id: string
          ignored: boolean
          lastSeenAt: string
          referrer: string | null
          resolved: boolean
          url: string
          userAgent: string | null
        }
        Insert: {
          firstSeenAt?: string
          hitCount?: number
          id: string
          ignored?: boolean
          lastSeenAt?: string
          referrer?: string | null
          resolved?: boolean
          url: string
          userAgent?: string | null
        }
        Update: {
          firstSeenAt?: string
          hitCount?: number
          id?: string
          ignored?: boolean
          lastSeenAt?: string
          referrer?: string | null
          resolved?: boolean
          url?: string
          userAgent?: string | null
        }
        Relationships: []
      }
      Order: {
        Row: {
          billingAddress: string | null
          couponId: string | null
          createdAt: string
          currency: string
          customerId: string | null
          discountTotal: number
          fulfillmentStatus: string
          id: string
          notes: string | null
          orderNumber: string
          paymentStatus: string
          shippingAddress: string | null
          shippingTotal: number
          status: string
          subtotal: number
          taxTotal: number
          total: number
          updatedAt: string
        }
        Insert: {
          billingAddress?: string | null
          couponId?: string | null
          createdAt?: string
          currency?: string
          customerId?: string | null
          discountTotal?: number
          fulfillmentStatus?: string
          id: string
          notes?: string | null
          orderNumber: string
          paymentStatus?: string
          shippingAddress?: string | null
          shippingTotal?: number
          status?: string
          subtotal?: number
          taxTotal?: number
          total?: number
          updatedAt: string
        }
        Update: {
          billingAddress?: string | null
          couponId?: string | null
          createdAt?: string
          currency?: string
          customerId?: string | null
          discountTotal?: number
          fulfillmentStatus?: string
          id?: string
          notes?: string | null
          orderNumber?: string
          paymentStatus?: string
          shippingAddress?: string | null
          shippingTotal?: number
          status?: string
          subtotal?: number
          taxTotal?: number
          total?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Order_couponId_fkey"
            columns: ["couponId"]
            isOneToOne: false
            referencedRelation: "Coupon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Order_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          billingCycleSnapshot: Database["public"]["Enums"]["BillingCycle"]
          createdAt: string
          descriptionSnapshot: string | null
          discountSnapshot: number
          domainSnapshot: string | null
          id: string
          lineTotal: number
          orderId: string
          productId: string | null
          productNameSnapshot: string
          productPriceId: string | null
          quantity: number
          selectedOptionsSnapshot: Json | null
          setupFeeSnapshot: number
          taxSnapshot: number
          tenantId: string
          unitPriceSnapshot: number
        }
        Insert: {
          billingCycleSnapshot: Database["public"]["Enums"]["BillingCycle"]
          createdAt?: string
          descriptionSnapshot?: string | null
          discountSnapshot?: number
          domainSnapshot?: string | null
          id: string
          lineTotal: number
          orderId: string
          productId?: string | null
          productNameSnapshot: string
          productPriceId?: string | null
          quantity?: number
          selectedOptionsSnapshot?: Json | null
          setupFeeSnapshot?: number
          taxSnapshot?: number
          tenantId: string
          unitPriceSnapshot: number
        }
        Update: {
          billingCycleSnapshot?: Database["public"]["Enums"]["BillingCycle"]
          createdAt?: string
          descriptionSnapshot?: string | null
          discountSnapshot?: number
          domainSnapshot?: string | null
          id?: string
          lineTotal?: number
          orderId?: string
          productId?: string | null
          productNameSnapshot?: string
          productPriceId?: string | null
          quantity?: number
          selectedOptionsSnapshot?: Json | null
          setupFeeSnapshot?: number
          taxSnapshot?: number
          tenantId?: string
          unitPriceSnapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_productPriceId_fkey"
            columns: ["productPriceId"]
            isOneToOne: false
            referencedRelation: "product_prices"
            referencedColumns: ["id"]
          },
        ]
      }
      OrderItem: {
        Row: {
          id: string
          name: string
          orderId: string
          price: number
          productId: string | null
          quantity: number
          sku: string | null
          total: number
          variantId: string | null
        }
        Insert: {
          id: string
          name: string
          orderId: string
          price: number
          productId?: string | null
          quantity: number
          sku?: string | null
          total: number
          variantId?: string | null
        }
        Update: {
          id?: string
          name?: string
          orderId?: string
          price?: number
          productId?: string | null
          quantity?: number
          sku?: string | null
          total?: number
          variantId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "OrderItem_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrderItem_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrderItem_variantId_fkey"
            columns: ["variantId"]
            isOneToOne: false
            referencedRelation: "ProductVariant"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          clientId: string
          createdAt: string
          currency: string
          discountTotal: number
          id: string
          idempotencyKey: string | null
          ipAddress: string | null
          notes: string | null
          orderNumber: string
          status: Database["public"]["Enums"]["OrderStatus"]
          subtotal: number
          taxTotal: number
          tenantId: string
          total: number
          updatedAt: string
          userAgent: string | null
        }
        Insert: {
          clientId: string
          createdAt?: string
          currency: string
          discountTotal?: number
          id: string
          idempotencyKey?: string | null
          ipAddress?: string | null
          notes?: string | null
          orderNumber: string
          status?: Database["public"]["Enums"]["OrderStatus"]
          subtotal: number
          taxTotal?: number
          tenantId: string
          total: number
          updatedAt: string
          userAgent?: string | null
        }
        Update: {
          clientId?: string
          createdAt?: string
          currency?: string
          discountTotal?: number
          id?: string
          idempotencyKey?: string | null
          ipAddress?: string | null
          notes?: string | null
          orderNumber?: string
          status?: Database["public"]["Enums"]["OrderStatus"]
          subtotal?: number
          taxTotal?: number
          tenantId?: string
          total?: number
          updatedAt?: string
          userAgent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_clientId_fkey"
            columns: ["clientId"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      Page: {
        Row: {
          blocks: string | null
          content: string
          contentFormat: string
          createdAt: string
          id: string
          publishedAt: string | null
          slug: string
          status: string
          title: string
          updatedAt: string
        }
        Insert: {
          blocks?: string | null
          content?: string
          contentFormat?: string
          createdAt?: string
          id: string
          publishedAt?: string | null
          slug: string
          status?: string
          title: string
          updatedAt: string
        }
        Update: {
          blocks?: string | null
          content?: string
          contentFormat?: string
          createdAt?: string
          id?: string
          publishedAt?: string | null
          slug?: string
          status?: string
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          actorId: string
          actorType: Database["public"]["Enums"]["AuthActorType"]
          consumedAt: string | null
          createdAt: string
          expiresAt: string
          id: string
          tenantId: string
          tokenHash: string
        }
        Insert: {
          actorId: string
          actorType: Database["public"]["Enums"]["AuthActorType"]
          consumedAt?: string | null
          createdAt?: string
          expiresAt: string
          id: string
          tenantId: string
          tokenHash: string
        }
        Update: {
          actorId?: string
          actorType?: Database["public"]["Enums"]["AuthActorType"]
          consumedAt?: string | null
          createdAt?: string
          expiresAt?: string
          id?: string
          tenantId?: string
          tokenHash?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          description: string | null
          id: string
          key: string
        }
        Insert: {
          category: string
          description?: string | null
          id: string
          key: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      Product: {
        Row: {
          barcode: string | null
          brand: string | null
          categoryId: string | null
          compareAtPrice: number | null
          costPrice: number | null
          createdAt: string
          currency: string
          description: string | null
          featured: boolean
          id: string
          images: string | null
          name: string
          price: number
          shortDescription: string | null
          sku: string | null
          slug: string
          specifications: string | null
          status: string
          updatedAt: string
          visibility: string
          weight: number | null
          weightUnit: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          categoryId?: string | null
          compareAtPrice?: number | null
          costPrice?: number | null
          createdAt?: string
          currency?: string
          description?: string | null
          featured?: boolean
          id: string
          images?: string | null
          name: string
          price?: number
          shortDescription?: string | null
          sku?: string | null
          slug: string
          specifications?: string | null
          status?: string
          updatedAt: string
          visibility?: string
          weight?: number | null
          weightUnit?: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          categoryId?: string | null
          compareAtPrice?: number | null
          costPrice?: number | null
          createdAt?: string
          currency?: string
          description?: string | null
          featured?: boolean
          id?: string
          images?: string | null
          name?: string
          price?: number
          shortDescription?: string | null
          sku?: string | null
          slug?: string
          specifications?: string | null
          status?: string
          updatedAt?: string
          visibility?: string
          weight?: number | null
          weightUnit?: string
        }
        Relationships: [
          {
            foreignKeyName: "Product_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "ProductCategory"
            referencedColumns: ["id"]
          },
        ]
      }
      product_groups: {
        Row: {
          createdAt: string
          deletedAt: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sortOrder: number
          tenantId: string
          updatedAt: string
          visibility: Database["public"]["Enums"]["ProductVisibility"]
        }
        Insert: {
          createdAt?: string
          deletedAt?: string | null
          description?: string | null
          id: string
          name: string
          slug: string
          sortOrder?: number
          tenantId: string
          updatedAt: string
          visibility?: Database["public"]["Enums"]["ProductVisibility"]
        }
        Update: {
          createdAt?: string
          deletedAt?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sortOrder?: number
          tenantId?: string
          updatedAt?: string
          visibility?: Database["public"]["Enums"]["ProductVisibility"]
        }
        Relationships: [
          {
            foreignKeyName: "product_groups_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          billingCycle: Database["public"]["Enums"]["BillingCycle"]
          clientGroupId: string | null
          createdAt: string
          currency: string
          effectiveFrom: string
          effectiveTo: string | null
          id: string
          isPromotional: boolean
          price: number
          productId: string
          setupFee: number
          tenantId: string
        }
        Insert: {
          billingCycle: Database["public"]["Enums"]["BillingCycle"]
          clientGroupId?: string | null
          createdAt?: string
          currency: string
          effectiveFrom?: string
          effectiveTo?: string | null
          id: string
          isPromotional?: boolean
          price: number
          productId: string
          setupFee?: number
          tenantId: string
        }
        Update: {
          billingCycle?: Database["public"]["Enums"]["BillingCycle"]
          clientGroupId?: string | null
          createdAt?: string
          currency?: string
          effectiveFrom?: string
          effectiveTo?: string | null
          id?: string
          isPromotional?: boolean
          price?: number
          productId?: string
          setupFee?: number
          tenantId?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_clientGroupId_fkey"
            columns: ["clientGroupId"]
            isOneToOne: false
            referencedRelation: "client_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ProductCategory: {
        Row: {
          description: string | null
          id: string
          image: string | null
          name: string
          parentId: string | null
          slug: string
        }
        Insert: {
          description?: string | null
          id: string
          image?: string | null
          name: string
          parentId?: string | null
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          parentId?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProductCategory_parentId_fkey"
            columns: ["parentId"]
            isOneToOne: false
            referencedRelation: "ProductCategory"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          createdAt: string
          deletedAt: string | null
          description: string | null
          id: string
          name: string
          productGroupId: string
          slug: string
          sortOrder: number
          status: Database["public"]["Enums"]["ProductStatus"]
          stockLimit: number | null
          stockUsed: number
          tenantId: string
          updatedAt: string
          visibility: Database["public"]["Enums"]["ProductVisibility"]
        }
        Insert: {
          createdAt?: string
          deletedAt?: string | null
          description?: string | null
          id: string
          name: string
          productGroupId: string
          slug: string
          sortOrder?: number
          status?: Database["public"]["Enums"]["ProductStatus"]
          stockLimit?: number | null
          stockUsed?: number
          tenantId: string
          updatedAt: string
          visibility?: Database["public"]["Enums"]["ProductVisibility"]
        }
        Update: {
          createdAt?: string
          deletedAt?: string | null
          description?: string | null
          id?: string
          name?: string
          productGroupId?: string
          slug?: string
          sortOrder?: number
          status?: Database["public"]["Enums"]["ProductStatus"]
          stockLimit?: number | null
          stockUsed?: number
          tenantId?: string
          updatedAt?: string
          visibility?: Database["public"]["Enums"]["ProductVisibility"]
        }
        Relationships: [
          {
            foreignKeyName: "products_productGroupId_fkey"
            columns: ["productGroupId"]
            isOneToOne: false
            referencedRelation: "product_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ProductVariant: {
        Row: {
          barcode: string | null
          compareAtPrice: number | null
          id: string
          image: string | null
          name: string
          options: string | null
          position: number
          price: number | null
          productId: string
          sku: string | null
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          compareAtPrice?: number | null
          id: string
          image?: string | null
          name: string
          options?: string | null
          position?: number
          price?: number | null
          productId: string
          sku?: string | null
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          compareAtPrice?: number | null
          id?: string
          image?: string | null
          name?: string
          options?: string | null
          position?: number
          price?: number | null
          productId?: string
          sku?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ProductVariant_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      ReadingSettings: {
        Row: {
          blogPageId: string | null
          homepageMode: string
          homepagePageId: string | null
          id: string
          updatedAt: string
        }
        Insert: {
          blogPageId?: string | null
          homepageMode?: string
          homepagePageId?: string | null
          id?: string
          updatedAt: string
        }
        Update: {
          blogPageId?: string | null
          homepageMode?: string
          homepagePageId?: string | null
          id?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ReadingSettings_blogPageId_fkey"
            columns: ["blogPageId"]
            isOneToOne: false
            referencedRelation: "Page"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ReadingSettings_homepagePageId_fkey"
            columns: ["homepagePageId"]
            isOneToOne: false
            referencedRelation: "Page"
            referencedColumns: ["id"]
          },
        ]
      }
      Redirect: {
        Row: {
          createdAt: string
          destination: string
          enabled: boolean
          hitCount: number
          id: string
          isRegex: boolean
          lastHitAt: string | null
          notes: string | null
          source: string
          statusCode: number
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          destination: string
          enabled?: boolean
          hitCount?: number
          id: string
          isRegex?: boolean
          lastHitAt?: string | null
          notes?: string | null
          source: string
          statusCode?: number
          updatedAt: string
        }
        Update: {
          createdAt?: string
          destination?: string
          enabled?: boolean
          hitCount?: number
          id?: string
          isRegex?: boolean
          lastHitAt?: string | null
          notes?: string | null
          source?: string
          statusCode?: number
          updatedAt?: string
        }
        Relationships: []
      }
      Review: {
        Row: {
          authorName: string
          content: string | null
          createdAt: string
          customerId: string | null
          id: string
          productId: string
          rating: number
          status: string
          title: string | null
        }
        Insert: {
          authorName: string
          content?: string | null
          createdAt?: string
          customerId?: string | null
          id: string
          productId: string
          rating: number
          status?: string
          title?: string | null
        }
        Update: {
          authorName?: string
          content?: string | null
          createdAt?: string
          customerId?: string | null
          id?: string
          productId?: string
          rating?: number
          status?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Review_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Review_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      RobotsTxtSettings: {
        Row: {
          content: string
          id: string
          updatedAt: string
        }
        Insert: {
          content?: string
          id?: string
          updatedAt: string
        }
        Update: {
          content?: string
          id?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Role: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          isSystem: boolean
          key: string
          name: string
          permissions: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          isSystem?: boolean
          key: string
          name: string
          permissions: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          isSystem?: boolean
          key?: string
          name?: string
          permissions?: string
          updatedAt?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          createdAt: string
          permissionId: string
          roleId: string
        }
        Insert: {
          createdAt?: string
          permissionId: string
          roleId: string
        }
        Update: {
          createdAt?: string
          permissionId?: string
          roleId?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permissionId_fkey"
            columns: ["permissionId"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_roleId_fkey"
            columns: ["roleId"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          isSystem: boolean
          key: string
          name: string
          tenantId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          isSystem?: boolean
          key: string
          name: string
          tenantId: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          isSystem?: boolean
          key?: string
          name?: string
          tenantId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      SeoAuditIssue: {
        Row: {
          auditRunId: string
          category: string
          createdAt: string
          entityId: string
          entityType: string
          id: string
          message: string
          ruleKey: string
          severity: string
          url: string
        }
        Insert: {
          auditRunId: string
          category: string
          createdAt?: string
          entityId: string
          entityType: string
          id: string
          message: string
          ruleKey: string
          severity: string
          url: string
        }
        Update: {
          auditRunId?: string
          category?: string
          createdAt?: string
          entityId?: string
          entityType?: string
          id?: string
          message?: string
          ruleKey?: string
          severity?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "SeoAuditIssue_auditRunId_fkey"
            columns: ["auditRunId"]
            isOneToOne: false
            referencedRelation: "SeoAuditRun"
            referencedColumns: ["id"]
          },
        ]
      }
      SeoAuditRun: {
        Row: {
          finishedAt: string | null
          id: string
          initiatedById: string | null
          issuesFound: number
          startedAt: string
          status: string
          summary: string | null
          totalUrls: number
        }
        Insert: {
          finishedAt?: string | null
          id: string
          initiatedById?: string | null
          issuesFound?: number
          startedAt?: string
          status?: string
          summary?: string | null
          totalUrls?: number
        }
        Update: {
          finishedAt?: string | null
          id?: string
          initiatedById?: string | null
          issuesFound?: number
          startedAt?: string
          status?: string
          summary?: string | null
          totalUrls?: number
        }
        Relationships: [
          {
            foreignKeyName: "SeoAuditRun_initiatedById_fkey"
            columns: ["initiatedById"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      SeoContentTypeSettings: {
        Row: {
          contentType: string
          descriptionTemplate: string | null
          id: string
          label: string
          robotsFollowDefault: boolean
          robotsIndexDefault: boolean
          schemaTypeDefault: string | null
          seoEditorVisible: boolean
          sitemapEnabled: boolean
          titleTemplate: string | null
        }
        Insert: {
          contentType: string
          descriptionTemplate?: string | null
          id: string
          label: string
          robotsFollowDefault?: boolean
          robotsIndexDefault?: boolean
          schemaTypeDefault?: string | null
          seoEditorVisible?: boolean
          sitemapEnabled?: boolean
          titleTemplate?: string | null
        }
        Update: {
          contentType?: string
          descriptionTemplate?: string | null
          id?: string
          label?: string
          robotsFollowDefault?: boolean
          robotsIndexDefault?: boolean
          schemaTypeDefault?: string | null
          seoEditorVisible?: boolean
          sitemapEnabled?: boolean
          titleTemplate?: string | null
        }
        Relationships: []
      }
      SeoGlobalSettings: {
        Row: {
          address: string | null
          authorArchiveNoindex: boolean
          contactEmail: string | null
          contactPhone: string | null
          dateArchiveNoindex: boolean
          defaultDescriptionTemplate: string | null
          defaultRobotsFollow: boolean
          defaultRobotsIndex: boolean
          defaultSocialImage: string | null
          defaultTitleTemplate: string
          id: string
          orgDescription: string | null
          orgLogo: string | null
          orgName: string | null
          orgType: string
          searchPageNoindex: boolean
          siteAlternateName: string | null
          siteName: string
          siteUrl: string
          socialProfiles: string | null
          titleSeparator: string
          updatedAt: string
        }
        Insert: {
          address?: string | null
          authorArchiveNoindex?: boolean
          contactEmail?: string | null
          contactPhone?: string | null
          dateArchiveNoindex?: boolean
          defaultDescriptionTemplate?: string | null
          defaultRobotsFollow?: boolean
          defaultRobotsIndex?: boolean
          defaultSocialImage?: string | null
          defaultTitleTemplate?: string
          id?: string
          orgDescription?: string | null
          orgLogo?: string | null
          orgName?: string | null
          orgType?: string
          searchPageNoindex?: boolean
          siteAlternateName?: string | null
          siteName?: string
          siteUrl?: string
          socialProfiles?: string | null
          titleSeparator?: string
          updatedAt: string
        }
        Update: {
          address?: string | null
          authorArchiveNoindex?: boolean
          contactEmail?: string | null
          contactPhone?: string | null
          dateArchiveNoindex?: boolean
          defaultDescriptionTemplate?: string | null
          defaultRobotsFollow?: boolean
          defaultRobotsIndex?: boolean
          defaultSocialImage?: string | null
          defaultTitleTemplate?: string
          id?: string
          orgDescription?: string | null
          orgLogo?: string | null
          orgName?: string | null
          orgType?: string
          searchPageNoindex?: boolean
          siteAlternateName?: string | null
          siteName?: string
          siteUrl?: string
          socialProfiles?: string | null
          titleSeparator?: string
          updatedAt?: string
        }
        Relationships: []
      }
      SeoMetadata: {
        Row: {
          additionalKeywords: string | null
          analyzedAt: string | null
          breadcrumbLabel: string | null
          canonicalMode: string
          canonicalUrl: string | null
          contentHash: string | null
          createdAt: string
          description: string | null
          entityId: string
          entityType: string
          focusKeyword: string | null
          id: string
          ogDescription: string | null
          ogImage: string | null
          ogTitle: string | null
          ogType: string | null
          robotsFollow: boolean
          robotsIndex: boolean
          robotsMaxImagePreview: string | null
          robotsMaxSnippet: number | null
          robotsMaxVideoPreview: number | null
          robotsNoarchive: boolean
          robotsNoimageindex: boolean
          robotsNosnippet: boolean
          schemaCustomJson: string | null
          schemaJson: string | null
          schemaType: string | null
          seoGrade: string | null
          seoScore: number | null
          seoScoreBreakdown: string | null
          sitemapInclude: boolean
          title: string | null
          twitterCard: string | null
          twitterDescription: string | null
          twitterImage: string | null
          twitterTitle: string | null
          updatedAt: string
        }
        Insert: {
          additionalKeywords?: string | null
          analyzedAt?: string | null
          breadcrumbLabel?: string | null
          canonicalMode?: string
          canonicalUrl?: string | null
          contentHash?: string | null
          createdAt?: string
          description?: string | null
          entityId: string
          entityType: string
          focusKeyword?: string | null
          id: string
          ogDescription?: string | null
          ogImage?: string | null
          ogTitle?: string | null
          ogType?: string | null
          robotsFollow?: boolean
          robotsIndex?: boolean
          robotsMaxImagePreview?: string | null
          robotsMaxSnippet?: number | null
          robotsMaxVideoPreview?: number | null
          robotsNoarchive?: boolean
          robotsNoimageindex?: boolean
          robotsNosnippet?: boolean
          schemaCustomJson?: string | null
          schemaJson?: string | null
          schemaType?: string | null
          seoGrade?: string | null
          seoScore?: number | null
          seoScoreBreakdown?: string | null
          sitemapInclude?: boolean
          title?: string | null
          twitterCard?: string | null
          twitterDescription?: string | null
          twitterImage?: string | null
          twitterTitle?: string | null
          updatedAt: string
        }
        Update: {
          additionalKeywords?: string | null
          analyzedAt?: string | null
          breadcrumbLabel?: string | null
          canonicalMode?: string
          canonicalUrl?: string | null
          contentHash?: string | null
          createdAt?: string
          description?: string | null
          entityId?: string
          entityType?: string
          focusKeyword?: string | null
          id?: string
          ogDescription?: string | null
          ogImage?: string | null
          ogTitle?: string | null
          ogType?: string | null
          robotsFollow?: boolean
          robotsIndex?: boolean
          robotsMaxImagePreview?: string | null
          robotsMaxSnippet?: number | null
          robotsMaxVideoPreview?: number | null
          robotsNoarchive?: boolean
          robotsNoimageindex?: boolean
          robotsNosnippet?: boolean
          schemaCustomJson?: string | null
          schemaJson?: string | null
          schemaType?: string | null
          seoGrade?: string | null
          seoScore?: number | null
          seoScoreBreakdown?: string | null
          sitemapInclude?: boolean
          title?: string | null
          twitterCard?: string | null
          twitterDescription?: string | null
          twitterImage?: string | null
          twitterTitle?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      SeoRuleConfig: {
        Row: {
          category: string
          config: string | null
          contentTypes: string | null
          enabled: boolean
          id: string
          key: string
          name: string
          severity: string
          weight: number
        }
        Insert: {
          category: string
          config?: string | null
          contentTypes?: string | null
          enabled?: boolean
          id: string
          key: string
          name: string
          severity?: string
          weight?: number
        }
        Update: {
          category?: string
          config?: string | null
          contentTypes?: string | null
          enabled?: boolean
          id?: string
          key?: string
          name?: string
          severity?: string
          weight?: number
        }
        Relationships: []
      }
      SitemapSettings: {
        Row: {
          contentTypeToggles: string | null
          enabled: boolean
          excludedEntities: string | null
          id: string
          includeImages: boolean
          updatedAt: string
          urlLimitPerFile: number
        }
        Insert: {
          contentTypeToggles?: string | null
          enabled?: boolean
          excludedEntities?: string | null
          id?: string
          includeImages?: boolean
          updatedAt: string
          urlLimitPerFile?: number
        }
        Update: {
          contentTypeToggles?: string | null
          enabled?: boolean
          excludedEntities?: string | null
          id?: string
          includeImages?: boolean
          updatedAt?: string
          urlLimitPerFile?: number
        }
        Relationships: []
      }
      staff_sessions: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          ip: string | null
          lastSeenAt: string
          revokedAt: string | null
          revokedReason: string | null
          tenantId: string
          tokenHash: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          ip?: string | null
          lastSeenAt?: string
          revokedAt?: string | null
          revokedReason?: string | null
          tenantId: string
          tokenHash: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          ip?: string | null
          lastSeenAt?: string
          revokedAt?: string | null
          revokedReason?: string | null
          tenantId?: string
          tokenHash?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_sessions_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_sessions_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_users: {
        Row: {
          createdAt: string
          deletedAt: string | null
          email: string
          emailVerifiedAt: string | null
          id: string
          lastLoginAt: string | null
          lastLoginIp: string | null
          lockedUntil: string | null
          mustChangePassword: boolean
          name: string
          passwordHash: string
          recoveryCodeHashes: Json | null
          roleId: string
          status: Database["public"]["Enums"]["StaffUserStatus"]
          tenantId: string
          twoFactorEnabled: boolean
          twoFactorSecret: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          deletedAt?: string | null
          email: string
          emailVerifiedAt?: string | null
          id: string
          lastLoginAt?: string | null
          lastLoginIp?: string | null
          lockedUntil?: string | null
          mustChangePassword?: boolean
          name: string
          passwordHash: string
          recoveryCodeHashes?: Json | null
          roleId: string
          status?: Database["public"]["Enums"]["StaffUserStatus"]
          tenantId: string
          twoFactorEnabled?: boolean
          twoFactorSecret?: string | null
          updatedAt: string
        }
        Update: {
          createdAt?: string
          deletedAt?: string | null
          email?: string
          emailVerifiedAt?: string | null
          id?: string
          lastLoginAt?: string | null
          lastLoginIp?: string | null
          lockedUntil?: string | null
          mustChangePassword?: boolean
          name?: string
          passwordHash?: string
          recoveryCodeHashes?: Json | null
          roleId?: string
          status?: Database["public"]["Enums"]["StaffUserStatus"]
          tenantId?: string
          twoFactorEnabled?: boolean
          twoFactorSecret?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_users_roleId_fkey"
            columns: ["roleId"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_users_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      status_histories: {
        Row: {
          actorId: string | null
          actorType: Database["public"]["Enums"]["AuditActorType"]
          createdAt: string
          entityId: string
          entityType: Database["public"]["Enums"]["StatusHistoryEntityType"]
          fromStatus: string | null
          id: string
          metadata: Json | null
          reason: string | null
          tenantId: string
          toStatus: string
        }
        Insert: {
          actorId?: string | null
          actorType: Database["public"]["Enums"]["AuditActorType"]
          createdAt?: string
          entityId: string
          entityType: Database["public"]["Enums"]["StatusHistoryEntityType"]
          fromStatus?: string | null
          id: string
          metadata?: Json | null
          reason?: string | null
          tenantId: string
          toStatus: string
        }
        Update: {
          actorId?: string | null
          actorType?: Database["public"]["Enums"]["AuditActorType"]
          createdAt?: string
          entityId?: string
          entityType?: Database["public"]["Enums"]["StatusHistoryEntityType"]
          fromStatus?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          tenantId?: string
          toStatus?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_histories_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          key: string
          tenantId: string
          updatedAt: string
          updatedBy: string | null
          value: Json
        }
        Insert: {
          id: string
          key: string
          tenantId: string
          updatedAt: string
          updatedBy?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          tenantId?: string
          updatedAt?: string
          updatedBy?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          createdAt: string
          id: string
          name: string
          slug: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          slug: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          slug?: string
          updatedAt?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          image: string | null
          isActive: boolean
          name: string
          passwordHash: string
          roleId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
          image?: string | null
          isActive?: boolean
          name: string
          passwordHash: string
          roleId: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          image?: string | null
          isActive?: boolean
          name?: string
          passwordHash?: string
          roleId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "User_roleId_fkey"
            columns: ["roleId"]
            isOneToOne: false
            referencedRelation: "Role"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hostmap_delete_blog_post: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      hostmap_delete_page: { Args: { p_page_id: string }; Returns: undefined }
      hostmap_has_permission: {
        Args: { p_permission_key: string; p_user_id: string }
        Returns: boolean
      }
      hostmap_increment_redirect_hit: {
        Args: { p_redirect_id: string }
        Returns: undefined
      }
      hostmap_is_staff: { Args: { p_user_id: string }; Returns: boolean }
      hostmap_log_not_found: {
        Args: { p_referrer?: string; p_url: string }
        Returns: undefined
      }
      hostmap_promote_to_staff: {
        Args: { p_role_keys: string[]; p_user_id: string }
        Returns: undefined
      }
      hostmap_publish_blog_post: {
        Args: { p_change_note?: string; p_post_id: string }
        Returns: {
          author_id: string | null
          blocks_snapshot: Json
          change_note: string | null
          created_at: string
          id: string
          post_id: string
          revision_number: number
          seo_snapshot: Json
          title: string
        }
        SetofOptions: {
          from: "*"
          to: "hostmap_blog_post_revisions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      hostmap_publish_page: {
        Args: { p_change_note?: string; p_page_id: string }
        Returns: {
          author_id: string | null
          blocks_snapshot: Json
          change_note: string | null
          created_at: string
          id: string
          page_id: string
          revision_number: number
          seo_snapshot: Json
          title: string
        }
        SetofOptions: {
          from: "*"
          to: "hostmap_page_revisions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      hostmap_publish_scheduled_content: {
        Args: never
        Returns: {
          content_type: string
          id: string
          revision_number: number
        }[]
      }
      hostmap_restore_blog_post: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      hostmap_restore_page: { Args: { p_page_id: string }; Returns: undefined }
      hostmap_schedule_blog_post: {
        Args: { p_post_id: string; p_scheduled_at: string }
        Returns: undefined
      }
      hostmap_schedule_page: {
        Args: { p_page_id: string; p_scheduled_at: string }
        Returns: undefined
      }
      hostmap_unpublish_blog_post: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      hostmap_unpublish_page: {
        Args: { p_page_id: string }
        Returns: undefined
      }
    }
    Enums: {
      AuditActorType: "STAFF" | "CLIENT_CONTACT" | "SYSTEM"
      AuditEntityType:
        | "CLIENT"
        | "CLIENT_CONTACT"
        | "STAFF_USER"
        | "ROLE"
        | "PRODUCT_GROUP"
        | "PRODUCT"
        | "PRODUCT_PRICE"
        | "ORDER"
        | "INVOICE"
        | "SYSTEM_SETTING"
        | "STAFF_SESSION"
        | "CLIENT_SESSION"
        | "IMPERSONATION"
      AuthActorType: "STAFF" | "CLIENT_CONTACT"
      BillingCycle:
        | "ONE_TIME"
        | "MONTHLY"
        | "QUARTERLY"
        | "SEMI_ANNUAL"
        | "ANNUAL"
        | "BIENNIAL"
        | "TRIENNIAL"
        | "CUSTOM"
      ClientContactStatus: "ACTIVE" | "DISABLED"
      ClientStatus: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "CLOSED"
      ClientType: "INDIVIDUAL" | "COMPANY"
      EmailStatus: "QUEUED" | "SENT" | "FAILED"
      hostmap_content_status: "draft" | "scheduled" | "published" | "archived"
      hostmap_user_type: "staff" | "customer"
      InvoiceStatus:
        | "DRAFT"
        | "ISSUED"
        | "UNPAID"
        | "PARTIALLY_PAID"
        | "PAID"
        | "OVERDUE"
        | "COLLECTIONS"
        | "CANCELLED"
        | "REFUNDED"
      OrderStatus:
        | "PENDING"
        | "AWAITING_PAYMENT"
        | "PAID"
        | "PROCESSING"
        | "ACTIVE"
        | "FRAUD_REVIEW"
        | "CANCELLED"
        | "FRAUD"
        | "REFUNDED"
        | "FAILED"
      ProductStatus: "ACTIVE" | "RETIRED"
      ProductVisibility: "PUBLIC" | "HIDDEN"
      RiskStatus: "NORMAL" | "REVIEW" | "BLOCKED"
      StaffUserStatus: "ACTIVE" | "DISABLED"
      StatusHistoryEntityType: "ORDER" | "INVOICE" | "CLIENT"
      VerificationStatus: "UNVERIFIED" | "VERIFIED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      AuditActorType: ["STAFF", "CLIENT_CONTACT", "SYSTEM"],
      AuditEntityType: [
        "CLIENT",
        "CLIENT_CONTACT",
        "STAFF_USER",
        "ROLE",
        "PRODUCT_GROUP",
        "PRODUCT",
        "PRODUCT_PRICE",
        "ORDER",
        "INVOICE",
        "SYSTEM_SETTING",
        "STAFF_SESSION",
        "CLIENT_SESSION",
        "IMPERSONATION",
      ],
      AuthActorType: ["STAFF", "CLIENT_CONTACT"],
      BillingCycle: [
        "ONE_TIME",
        "MONTHLY",
        "QUARTERLY",
        "SEMI_ANNUAL",
        "ANNUAL",
        "BIENNIAL",
        "TRIENNIAL",
        "CUSTOM",
      ],
      ClientContactStatus: ["ACTIVE", "DISABLED"],
      ClientStatus: ["ACTIVE", "PENDING_VERIFICATION", "SUSPENDED", "CLOSED"],
      ClientType: ["INDIVIDUAL", "COMPANY"],
      EmailStatus: ["QUEUED", "SENT", "FAILED"],
      hostmap_content_status: ["draft", "scheduled", "published", "archived"],
      hostmap_user_type: ["staff", "customer"],
      InvoiceStatus: [
        "DRAFT",
        "ISSUED",
        "UNPAID",
        "PARTIALLY_PAID",
        "PAID",
        "OVERDUE",
        "COLLECTIONS",
        "CANCELLED",
        "REFUNDED",
      ],
      OrderStatus: [
        "PENDING",
        "AWAITING_PAYMENT",
        "PAID",
        "PROCESSING",
        "ACTIVE",
        "FRAUD_REVIEW",
        "CANCELLED",
        "FRAUD",
        "REFUNDED",
        "FAILED",
      ],
      ProductStatus: ["ACTIVE", "RETIRED"],
      ProductVisibility: ["PUBLIC", "HIDDEN"],
      RiskStatus: ["NORMAL", "REVIEW", "BLOCKED"],
      StaffUserStatus: ["ACTIVE", "DISABLED"],
      StatusHistoryEntityType: ["ORDER", "INVOICE", "CLIENT"],
      VerificationStatus: ["UNVERIFIED", "VERIFIED"],
    },
  },
} as const
