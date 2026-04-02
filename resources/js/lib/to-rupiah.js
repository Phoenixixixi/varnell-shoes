import { toRupiah, convertToWords } from 'to-rupiah';

export function formatRupiah(price) {
    const money = Number(price)
    return toRupiah(money, { Symbol: 'Rp' })
}