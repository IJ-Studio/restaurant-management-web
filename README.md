
```
restaurant-management-platform
├─ app
│  ├─ (auth)
│  │  ├─ frm_reset
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  ├─ register
│  │  │  └─ page.tsx
│  │  └─ reset
│  │     └─ page.tsx
│  ├─ (public)
│  │  └─ reservations
│  │     └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  └─ users
│  │  │     ├─ route.ts
│  │  │     └─ [id]
│  │  │        └─ route.ts
│  │  ├─ auth
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  ├─ logout
│  │  │  │  └─ route.ts
│  │  │  ├─ me
│  │  │  │  └─ route.ts
│  │  │  └─ register
│  │  │     └─ route.ts
│  │  ├─ backups
│  │  │  └─ route.ts
│  │  ├─ cron
│  │  │  └─ backups
│  │  │     └─ route.ts
│  │  ├─ inventory
│  │  │  ├─ mermas
│  │  │  │  └─ route.ts
│  │  │  ├─ orders
│  │  │  │  └─ route.ts
│  │  │  ├─ products
│  │  │  │  ├─ adjust
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  └─ suppliers
│  │  │     └─ route.ts
│  │  ├─ menu
│  │  │  ├─ categories
│  │  │  │  └─ route.ts
│  │  │  └─ _meta.ts
│  │  ├─ public
│  │  │  ├─ combos
│  │  │  │  └─ route.ts
│  │  │  └─ cupones
│  │  │     └─ route.ts
│  │  ├─ reservations
│  │  │  └─ route.ts
│  │  └─ settings
│  │     └─ route.ts
│  ├─ dashboard
│  │  ├─ admin
│  │  │  ├─ about
│  │  │  │  └─ page.tsx
│  │  │  ├─ db-performance
│  │  │  │  └─ page.tsx
│  │  │  ├─ finance
│  │  │  │  ├─ invoices
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ inventory
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ suppliers
│  │  │  │     └─ page.tsx
│  │  │  ├─ menu
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ predictive
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ predictivo.css
│  │  │  ├─ reports
│  │  │  │  └─ page.tsx
│  │  │  ├─ reservations
│  │  │  │  └─ page.tsx
│  │  │  ├─ settings
│  │  │  │  └─ page.tsx
│  │  │  └─ users
│  │  │     └─ page.tsx
│  │  ├─ cajero
│  │  │  └─ page.tsx
│  │  ├─ cliente
│  │  │  └─ page.tsx
│  │  ├─ cocina
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ mesero
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ error.module.css
│  ├─ error.tsx
│  ├─ forbidden
│  │  └─ page.tsx
│  ├─ forbidden.module.css
│  ├─ layout.tsx
│  ├─ loading.tsx
│  ├─ maintenance
│  │  └─ page.tsx
│  ├─ maintenance.module.css
│  ├─ menu
│  │  ├─ categoria
│  │  │  └─ [slug]
│  │  │     └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ pedido
│  │  │  └─ page.tsx
│  │  └─ producto
│  │     └─ [id]
│  │        └─ page.tsx
│  ├─ not-found.module.css
│  ├─ not-found.tsx
│  ├─ page.tsx
│  ├─ test-error
│  │  └─ page.tsx
│  ├─ unauthorized
│  │  └─ page.tsx
│  └─ unauthorized.module.css
├─ check_backups.ts
├─ components
│  ├─ admin
│  │  ├─ AdminSidebar.tsx
│  │  ├─ ExportModal.tsx
│  │  └─ Importpreviewmodal.tsx
│  ├─ BackButton.tsx
│  ├─ Button.tsx
│  ├─ Checkbox.tsx
│  ├─ ClientLayoutWrapper.tsx
│  ├─ ConditionalNavbar.tsx
│  ├─ dropdown.tsx
│  ├─ FloatingInput.tsx
│  ├─ handlerEmailActions.tsx
│  ├─ IdleLogout.tsx
│  ├─ landing
│  │  ├─ AboutSection.tsx
│  │  ├─ CategoriesSection.tsx
│  │  ├─ Footer.tsx
│  │  ├─ Hero.tsx
│  │  ├─ MenuSection.tsx
│  │  ├─ MolinoAnimado.jsx
│  │  ├─ PromosSection.tsx
│  │  └─ ReservationSection.tsx
│  ├─ layout
│  │  └─ Sidebar.tsx
│  ├─ Navbar.tsx
│  ├─ PasswordRequirements.tsx
│  ├─ PasswordToggleButton.tsx
│  ├─ PhoneInput.tsx
│  ├─ providers
│  │  ├─ AppProviders.tsx
│  │  ├─ DesignSystemProvider.tsx
│  │  └─ ThemeProvider.tsx
│  ├─ reservations
│  │  ├─ ReservationSidebar.tsx
│  │  └─ TableMap.tsx
│  ├─ ThemeToggle.tsx
│  └─ ui
│     ├─ Button.tsx
│     └─ index.ts
├─ config
│  ├─ navigation
│  │  ├─ admin.nav.ts
│  │  ├─ cajero.nav.ts
│  │  └─ cocina.nav.ts
│  ├─ restaurant.config.ts
│  └─ roles.config.ts
├─ delete_cron_date.cjs
├─ docs
│  └─ diagnostico-frontend.md
├─ drizzle
│  ├─ 0002_sturdy_lord_tyger.sql
│  └─ meta
│     ├─ 0002_snapshot.json
│     └─ _journal.json
├─ features
│  ├─ dashboard
│  │  ├─ admin
│  │  │  ├─ components
│  │  │  │  ├─ about
│  │  │  │  │  ├─ AboutSection.tsx
│  │  │  │  │  ├─ ContactSection.tsx
│  │  │  │  │  ├─ FeaturesSection.tsx
│  │  │  │  │  ├─ GallerySection.tsx
│  │  │  │  │  ├─ IdentitySection.tsx
│  │  │  │  │  └─ ScheduleSection.tsx
│  │  │  │  ├─ AboutPreviewModal.tsx
│  │  │  │  ├─ AdjustModal.tsx
│  │  │  │  ├─ CategorySection.tsx
│  │  │  │  ├─ charts
│  │  │  │  │  ├─ BarChart.tsx
│  │  │  │  │  ├─ DonutChart.tsx
│  │  │  │  │  └─ Sparkline.tsx
│  │  │  │  ├─ CloseSessionModal.tsx
│  │  │  │  ├─ DashboardTopBar.tsx
│  │  │  │  ├─ HourBarsChart.tsx
│  │  │  │  ├─ inventory
│  │  │  │  │  ├─ InventoryStats.tsx
│  │  │  │  │  ├─ InventoryTable.tsx
│  │  │  │  │  └─ MermaList.tsx
│  │  │  │  ├─ InvoiceDrawer.tsx
│  │  │  │  ├─ InvoiceModal.tsx
│  │  │  │  ├─ ItemModal.tsx
│  │  │  │  ├─ KpiCard.tsx
│  │  │  │  ├─ MenuCard.tsx
│  │  │  │  ├─ MermaModal.tsx
│  │  │  │  ├─ MovementModal.tsx
│  │  │  │  ├─ OrderModal.tsx
│  │  │  │  ├─ PaymentSplit.tsx
│  │  │  │  ├─ ProductModal.tsx
│  │  │  │  ├─ QuickActions.tsx
│  │  │  │  ├─ RecentOrdersTable.tsx
│  │  │  │  ├─ reservations
│  │  │  │  │  ├─ ReservationCalendar.tsx
│  │  │  │  │  ├─ ReservationList.tsx
│  │  │  │  │  └─ ReservationModal.tsx
│  │  │  │  ├─ RoleBadge.tsx
│  │  │  │  ├─ SectionCard.tsx
│  │  │  │  ├─ SettingRow.tsx
│  │  │  │  ├─ settings
│  │  │  │  │  ├─ AppearanceSection.tsx
│  │  │  │  │  ├─ BackupSection.tsx
│  │  │  │  │  ├─ BrandingSection.tsx
│  │  │  │  │  ├─ GatewayModal.tsx
│  │  │  │  │  ├─ GatewaySection.tsx
│  │  │  │  │  ├─ LandscapeSection.tsx
│  │  │  │  │  └─ OfflineSection.tsx
│  │  │  │  ├─ StockAlerts.tsx
│  │  │  │  ├─ SupplierCard.tsx
│  │  │  │  ├─ SupplierModal.tsx
│  │  │  │  ├─ TableStatusGrid.tsx
│  │  │  │  ├─ TagBadge.tsx
│  │  │  │  ├─ TipModal.tsx
│  │  │  │  ├─ Toggle.tsx
│  │  │  │  └─ users
│  │  │  │     ├─ AccessDrawer.tsx
│  │  │  │     ├─ AccessMatrix.tsx
│  │  │  │     ├─ AdminReports.tsx
│  │  │  │     ├─ IncidencePanel.tsx
│  │  │  │     ├─ ShiftCalendar.tsx
│  │  │  │     ├─ UserFilters.tsx
│  │  │  │     ├─ UserModal.tsx
│  │  │  │     └─ UserTable.tsx
│  │  │  ├─ data
│  │  │  │  ├─ aboutMock.ts
│  │  │  │  ├─ financeMock.tsx
│  │  │  │  ├─ inventoryMock.tsx
│  │  │  │  ├─ invoicesMock.tsx
│  │  │  │  ├─ menuMock.tsx
│  │  │  │  ├─ mockData.ts
│  │  │  │  ├─ reportsMock.tsx
│  │  │  │  ├─ settingsMock.tsx
│  │  │  │  ├─ suppliersMock.tsx
│  │  │  │  └─ usersMock.tsx
│  │  │  └─ utils
│  │  │     └─ menuUtils.ts
│  │  ├─ cajero
│  │  │  ├─ components
│  │  │  │  ├─ BillingModal.tsx
│  │  │  │  ├─ PaymentDistribution.tsx
│  │  │  │  ├─ StatCard.tsx
│  │  │  │  └─ TicketRow.tsx
│  │  │  └─ data
│  │  │     └─ cajeroMock.ts
│  │  ├─ cliente
│  │  │  ├─ components
│  │  │  │  ├─ BottomNav.tsx
│  │  │  │  ├─ CartDrawer.tsx
│  │  │  │  ├─ ClientNav.tsx
│  │  │  │  └─ tabs
│  │  │  │     ├─ HistoryTab.tsx
│  │  │  │     ├─ HomeTab.tsx
│  │  │  │     ├─ MenuTab.tsx
│  │  │  │     └─ TrackingTab.tsx
│  │  │  └─ data
│  │  │     └─ clienteMock.ts
│  │  ├─ cocina
│  │  │  ├─ components
│  │  │  │  ├─ InventoryModal.tsx
│  │  │  │  ├─ KanbanColumn.tsx
│  │  │  │  ├─ KitchenHeader.tsx
│  │  │  │  ├─ KitchenStats.tsx
│  │  │  │  ├─ OrderCard.tsx
│  │  │  │  └─ StockAlertBanner.tsx
│  │  │  └─ data
│  │  │     └─ cocinaMock.ts
│  │  └─ mesero
│  │     └─ components
│  │        ├─ OrderModal.tsx
│  │        ├─ TableCard.tsx
│  │        └─ TableGrid.tsx
│  └─ shared
│     ├─ data
│     │  └─ restaurantData.ts
│     └─ services
│        └─ dataService.ts
├─ hooks
│  ├─ useAppSelector.ts
│  ├─ useAsyncAction.ts
│  ├─ useBreakpoint.ts
│  ├─ useFetch.ts
│  ├─ useInventory.tsx
│  ├─ useLockout.ts
│  ├─ useMediaQuery.ts
│  ├─ useRedirect.ts
│  ├─ useReservationAvailability.ts
│  ├─ useResponsiveNavbar.ts
│  └─ useTheme.ts
├─ lib
│  ├─ api.ts
│  ├─ db.ts
│  ├─ schema.ts
│  ├─ session.ts
│  └─ utils.ts
├─ middleware.ts.bk
├─ next.config.js
├─ package.json
├─ pnpm-lock.yaml
├─ postcss.config.mjs
├─ providers
│  └─ AuthProvider.tsx
├─ proxy.ts
├─ README.md
├─ requisitos funcionales.md
├─ setup_settings.cjs
├─ setup_settings.js
├─ setup_settings.ts
├─ store
│  ├─ index.ts
│  └─ slices
│     └─ authSlice.ts
├─ store.ts
├─ styles
│  ├─ globals.css
│  └─ loading.css
├─ tailwind.config.js
├─ tsconfig.json
├─ types
│  ├─ auth.ts
│  ├─ ButtonProps.tsx
│  ├─ index.ts
│  ├─ navigation.ts
│  └─ ui.ts
├─ utils
│  ├─ supabase
│  │  ├─ client.ts
│  │  ├─ middleware.ts
│  │  └─ server.ts
│  └─ validators.tsx
├─ vercel.json
└─ workplan.md

```