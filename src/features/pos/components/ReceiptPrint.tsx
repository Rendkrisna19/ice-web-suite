// src/features/pos/components/ReceiptPrint.tsx

export function ReceiptPrint({ order, merchantName }: any) {
  return (
    <div id="thermal-receipt" className="hidden print:block w-[58mm] bg-white p-2 text-black font-mono text-[10px] leading-tight">
      <div className="text-center mb-4">
        <h2 className="text-sm font-bold uppercase">{merchantName}</h2>
        <p>Jl. Contoh No. 123, Medan</p>
        <p>WA: 0812-3456-7890</p>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>
      
      <div className="mb-2">
        <p>No: {order.order_number}</p>
        <p>Tgl: {new Date().toLocaleString('id-ID')}</p>
        <p>Cust: {order.delivery_address}</p>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      <table className="w-full mb-2">
        <tbody>
          {order.items.map((item: any, idx: number) => (
            <tr key={idx} className="align-top">
              <td colSpan={2} className="pt-1">{item.product_name_snap}</td>
              <td className="text-right pt-1">{item.quantity}x</td>
              <td className="text-right pt-1">{(item.product_price_snap * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black my-2"></div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{Number(order.subtotal).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>PPN (10%)</span>
          <span>{Number(order.tax).toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{Number(order.total_price).toLocaleString()}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-4"></div>

      <div className="text-center italic">
        <p>Terima Kasih</p>
        <p>Selamat Menikmati!</p>
      </div>
    </div>
  );
}