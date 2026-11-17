# Catalog indexing
This is the complete source and test inventory for the catalog deployment unit.
apps/catalog.mjs is the product listing entry point. The disk reader should
build without depending on the application. Hidden products must never be
listed for public callers. Preview and reconcile use the same public visibility
policy under the Product Catalog team. Separately scoped internal inspection is
allowed to show hidden products.
