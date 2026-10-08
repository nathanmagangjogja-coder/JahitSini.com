set -u

echo "== 1. Hapus file/folder yang tidak dipakai =="
rm -rfv app/tracking app/api/chat
rm -rfv app/admin/orders app/admin/customers app/admin/messages
rm -rfv app/api/secure/admin/orders app/api/secure/admin/customers app/api/secure/admin/messages
rm -fv  components/admin/OrderActionsMenu.tsx components/admin/OrderDetailDialog.tsx
rm -fv  components/ui/OrderTimeline.tsx components/ui/Dialog.tsx
rm -fv  components/tracking/TrackingClient.tsx components/tracking/OrderChat.tsx
rm -fv  lib/orders.ts lib/chatPolicy.ts lib/whatsappNotify.ts
rm -fv  supabase/migrations/0011_service_details.sql
rmdir components/tracking components/sections 2>/dev/null || true

echo "== 2. Hapus build cache & dependensi dari folder kerja (tidak ikut di-zip / commit) =="
rm -rf .next

echo "== 3. Pastikan .env tidak pernah ter-commit =="
git rm --cached -q .env 2>/dev/null && echo ".env dilepas dari Git" || echo ".env sudah aman (tidak dilacak)"

echo "== 4. Cek sisa kode harga (harus kosong) =="
grep -rniE "priceStart|priceNotes|priceEstimate|priceFinal|price_start|price_notes|price_estimate|price_final|formatRupiah|sampleOrders|notifyUrgent|whatsappNotify|chatPolicy" \
  app components lib middleware.ts --include=*.ts --include=*.tsx || echo "OK: tidak ada sisa harga di kode"

echo "== 5. Cek import & variabel tidak terpakai (harus tanpa output) =="
npx tsc --noEmit --noUnusedLocals

echo "== 6. Cek export yang tidak dipakai file lain (opsional, untuk dicek manual) =="
npx --yes ts-prune 2>/dev/null | grep -v "used in module" | grep -vE "(page|layout|route|loading|error|not-found|sitemap|robots|middleware)\.tsx?|next-env|\.next" || true

echo "Selesai."