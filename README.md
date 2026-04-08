
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
│  ├─ api
│  │  └─ auth
│  │     ├─ login
│  │     │  └─ route.ts
│  │     ├─ logout
│  │     │  └─ route.ts
│  │     └─ register
│  │        └─ route.ts
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
│  ├─ not-found.module.css
│  ├─ not-found.tsx
│  ├─ page.tsx
│  ├─ test-error
│  │  └─ page.tsx
│  ├─ unauthorized
│  │  └─ page.tsx
│  └─ unauthorized.module.css
├─ components
│  ├─ admin
│  │  ├─ AdminSidebar.tsx
│  │  ├─ ExportModal.tsx
│  │  └─ Importpreviewmodal.tsx
│  ├─ Button.tsx
│  ├─ dropdown.tsx
│  ├─ handlerEmailActions.tsx
│  ├─ IdleLogout.tsx
│  ├─ layout
│  │  └─ Sidebar.tsx
│  ├─ nav.tsx
│  ├─ providers
│  │  ├─ AppProviders.tsx
│  │  └─ DesignSystemProvider.tsx
│  ├─ shared
│  │  └─ ThemeProvider.tsx
│  ├─ ThemeProvider.tsx
│  └─ ui
│     ├─ Button.tsx
│     └─ index.ts
├─ config
│  ├─ navigation
│  │  ├─ admin.nav.ts
│  │  ├─ cajero.nav.ts
│  │  └─ cocina.nav.ts
│  └─ restaurant.config.ts
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
│  └─ useRedirect.ts
├─ lib
│  └─ session.ts
├─ middleware.ts
├─ next.config.js
├─ package.json
├─ pnpm-lock.yaml
├─ postcss.config.js
├─ README.md
├─ requisitos funcionales.md
├─ store
│  ├─ index.ts
│  └─ slices
│     └─ authSlice.ts
├─ store.ts
├─ styles
│  ├─ globals.css
│  └─ loading.css
├─ tsconfig.json
├─ types
│  ├─ auth.ts
│  ├─ ButtonProps.tsx
│  ├─ index.ts
│  ├─ navigation.ts
│  └─ ui.ts
└─ utils
   └─ validators.tsx

```