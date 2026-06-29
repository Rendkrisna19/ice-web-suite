"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";

// Services & Types
import { reportService } from "@/features/admin/reports/services/reportService";
import { outletService } from "@/features/admin/merchants/services/outletService";
import { Outlet } from "@/types/merchant";
import { AnalyticsResponse, OutletFilterValue, ReportStatUI } from "@/types/reports";

// Components
import AdminHeader from "@/features/admin/components/AdminHeader";
import ReportToolbar from "./components/ReportToolbar";
import ReportStatCards from "./components/ReportStatCards";
import RevenueChart from "./components/RevenueChart";
import TransactionTable from "./components/TransactionTable";

export default function ReportBoard() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  
  // State Filter & Export
  const [dateRange, setDateRange] = useState({ start: "", end: "" }); 
  const [dateLabel, setDateLabel] = useState("Bulan Ini");
  const [selectedOutletId, setSelectedOutletId] = useState<OutletFilterValue>("all");
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Fetch Data dari API
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await reportService.getAnalytics(dateRange.start, dateRange.end, selectedOutletId);
      setData(response);
    } catch (error) {
      console.error("Fetch analytics error:", error);
      toast.error("Gagal memuat data laporan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedOutletId]);

  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const outletData = await outletService.getOutlets();
        setOutlets(outletData);
      } catch (error) {
        console.error("Gagal memuat daftar counter:", error);
      }
    };

    loadOutlets();
  }, []);

  // Handlers
  const handleRefresh = () => {
    fetchAnalytics();
    toast.success("Laporan diperbarui!");
  };

  const handleDateChange = (start: string, end: string, label: string) => {
    setDateRange({ start, end });
    setDateLabel(label);
  };

  const handleOutletChange = (outletId: OutletFilterValue) => {
    setSelectedOutletId(outletId);
  };

  // Helper untuk memicu unduhan file dari Blob di Browser
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getLatestAnalyticsForExport = async () => {
    return reportService.getAnalytics(dateRange.start, dateRange.end, selectedOutletId);
  };

  // Handler Export Excel
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const toastId = toast.loading("Menyiapkan file Excel...");

      const analytics = await getLatestAnalyticsForExport();
      setData(analytics);

      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ICE Admin";
      workbook.created = new Date();

      const selectedOutletName = selectedOutletId === "all"
        ? "Semua Counter"
        : outlets.find((outlet) => outlet.id === selectedOutletId)?.name || `Outlet #${selectedOutletId}`;

      const currencyFormat = '"Rp" #,##0';
      const percentFormat = "0.00%";
      const headerFill = {
        type: "pattern" as const,
        pattern: "solid" as const,
        fgColor: { argb: "FF15423C" }
      };
      const headerFont = { color: { argb: "FFFFFFFF" }, bold: true };
      const border = {
        top: { style: "thin" as const, color: { argb: "FFD9D9D9" } },
        left: { style: "thin" as const, color: { argb: "FFD9D9D9" } },
        bottom: { style: "thin" as const, color: { argb: "FFD9D9D9" } },
        right: { style: "thin" as const, color: { argb: "FFD9D9D9" } }
      };

      const summarySheet = workbook.addWorksheet("Summary", {
        views: [{ showGridLines: false, state: "frozen", ySplit: 16 }]
      });
      summarySheet.columns = [
        { width: 24 },
        { width: 20 },
        { width: 20 },
        { width: 18 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 }
      ];

      summarySheet.mergeCells("A1:J1");
      summarySheet.getCell("A1").value = "LAPORAN ANALITIK";
      summarySheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF15423C" } };

      summarySheet.getCell("A2").value = "Periode";
      summarySheet.getCell("B2").value = `${analytics.applied_filters?.start_date || dateRange.start || "-"} s/d ${analytics.applied_filters?.end_date || dateRange.end || "-"}`;
      summarySheet.getCell("A3").value = "Counter";
      summarySheet.getCell("B3").value = selectedOutletName;

      summarySheet.getRow(5).values = ["Metrik", "Nilai", "Growth"];
      ["A5", "B5", "C5"].forEach((cell) => {
        summarySheet.getCell(cell).fill = headerFill;
        summarySheet.getCell(cell).font = headerFont;
        summarySheet.getCell(cell).border = border;
      });

      const metricRows: Array<[string, number | string, number | null | undefined, "currency" | "percent" | "count"]> = [
        ["Total Omzet Bruto", analytics.summary.revenue.value, analytics.summary.revenue.growth, "currency"],
        ["Pendapatan Bersih (Fee)", analytics.summary.net_income.value, analytics.summary.net_income.growth, "currency"],
        ["Gross Sales", analytics.summary.gross_sales.value, analytics.summary.gross_sales.growth, "currency"],
        ["COGS", analytics.summary.cogs.value, analytics.summary.cogs.growth, "currency"],
        ["Gross Profit", analytics.summary.gross_profit.value, analytics.summary.gross_profit.growth, "currency"],
        ["Gross Margin", Number(analytics.summary.gross_margin_percent.value) / 100, analytics.summary.gross_margin_percent.growth, "percent"],
        ["Total Transaksi", analytics.summary.orders.value, analytics.summary.orders.growth, "count"],
        ["Total Item Terjual", analytics.summary.total_items_sold.value, analytics.summary.total_items_sold.growth, "count"],
        ["Refund / Batal", analytics.summary.refund.value, analytics.summary.refund.growth, "currency"]
      ];

      metricRows.forEach((item, idx) => {
        const rowIndex = 6 + idx;
        const row = summarySheet.getRow(rowIndex);
        row.getCell(1).value = item[0];
        row.getCell(2).value = item[1];
        row.getCell(3).value = item[2] === null || item[2] === undefined ? "-" : Number(item[2]) / 100;

        if (item[3] === "currency") row.getCell(2).numFmt = currencyFormat;
        if (item[3] === "percent") row.getCell(2).numFmt = percentFormat;
        if (item[3] === "count") row.getCell(2).numFmt = "#,##0";
        if (row.getCell(3).value !== "-") row.getCell(3).numFmt = percentFormat;

        [1, 2, 3].forEach((col) => {
          row.getCell(col).border = border;
        });
      });

      const trxTitleRow = 16;
      summarySheet.mergeCells(`A${trxTitleRow}:J${trxTitleRow}`);
      summarySheet.getCell(`A${trxTitleRow}`).value = "RIWAYAT TRANSAKSI";
      summarySheet.getCell(`A${trxTitleRow}`).font = { bold: true, color: { argb: "FF15423C" } };

      const trxHeaderRow = 17;
      const trxHeaders = ["Order", "Waktu", "Counter", "Customer", "Status", "Total Order", "App Fee", "Gross Sales", "COGS", "Gross Profit"];
      summarySheet.getRow(trxHeaderRow).values = trxHeaders;
      for (let i = 1; i <= trxHeaders.length; i += 1) {
        const cell = summarySheet.getRow(trxHeaderRow).getCell(i);
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.border = border;
      }

      analytics.recent_orders.forEach((trx, idx) => {
        const row = summarySheet.getRow(trxHeaderRow + 1 + idx);
        row.values = [
          trx.order_number || `#${trx.id}`,
          trx.created_at ? new Date(trx.created_at).toLocaleString("id-ID") : "-",
          trx.outlet?.name || "-",
          trx.user?.name || "-",
          trx.status,
          Number(trx.total_price),
          Number(trx.app_fee_est ?? (Number(trx.delivery_fee) + Number(trx.tax))),
          Number(trx.gross_sales_est ?? 0),
          Number(trx.cogs_est ?? 0),
          Number(trx.gross_profit_est ?? 0)
        ];

        [6, 7, 8, 9, 10].forEach((col) => {
          row.getCell(col).numFmt = currencyFormat;
        });

        for (let i = 1; i <= trxHeaders.length; i += 1) {
          row.getCell(i).border = border;
        }
      });

      summarySheet.autoFilter = {
        from: { row: trxHeaderRow, column: 1 },
        to: { row: trxHeaderRow + Math.max(analytics.recent_orders.length, 1), column: 10 }
      };

      const filtersSheet = workbook.addWorksheet("Filters");
      filtersSheet.columns = [{ width: 20 }, { width: 40 }];
      filtersSheet.addRows([
        ["Key", "Value"],
        ["Start Date", analytics.applied_filters?.start_date || dateRange.start || "-"],
        ["End Date", analytics.applied_filters?.end_date || dateRange.end || "-"],
        ["Outlet Mode", analytics.applied_filters?.outlet_mode || (selectedOutletId === "all" ? "all_outlets" : "single_outlet")],
        ["Outlet ID", analytics.applied_filters?.outlet_id ?? (selectedOutletId === "all" ? "all" : selectedOutletId)],
        ["Outlet Name", selectedOutletName]
      ]);
      ["A1", "B1"].forEach((cell) => {
        filtersSheet.getCell(cell).fill = headerFill;
        filtersSheet.getCell(cell).font = headerFont;
      });

      const unitSheet = workbook.addWorksheet("Unit Economics");
      unitSheet.columns = [{ width: 28 }, { width: 22 }];
      unitSheet.addRows([
        ["Metric", "Value"],
        ["Gross Sales", analytics.unit_economics?.gross_sales ?? 0],
        ["COGS", analytics.unit_economics?.cogs ?? 0],
        ["Gross Profit", analytics.unit_economics?.gross_profit ?? 0],
        ["Gross Margin %", Number(analytics.unit_economics?.gross_margin_percent ?? 0) / 100],
        ["App Fee Income", analytics.unit_economics?.app_fee_income ?? 0],
        ["Combined Income", analytics.unit_economics?.combined_income ?? 0],
        ["Total Items Sold", analytics.unit_economics?.total_items_sold ?? 0]
      ]);
      ["A1", "B1"].forEach((cell) => {
        unitSheet.getCell(cell).fill = headerFill;
        unitSheet.getCell(cell).font = headerFont;
      });
      for (let row = 2; row <= 8; row += 1) {
        if (row === 5) {
          unitSheet.getCell(`B${row}`).numFmt = percentFormat;
        } else if (row === 8) {
          unitSheet.getCell(`B${row}`).numFmt = "#,##0";
        } else {
          unitSheet.getCell(`B${row}`).numFmt = currencyFormat;
        }
      }

      const chartSheet = workbook.addWorksheet("Chart Data");
      chartSheet.columns = [
        { header: "Date", key: "date", width: 14 },
        { header: "Gross", key: "gross", width: 16 },
        { header: "Net", key: "net", width: 16 },
        { header: "Gross Sales", key: "gross_sales", width: 16 },
        { header: "COGS", key: "cogs", width: 16 },
        { header: "Gross Profit", key: "gross_profit", width: 16 }
      ];
      analytics.chart.forEach((point) => {
        chartSheet.addRow({
          date: point.date,
          gross: Number(point.gross),
          net: Number(point.net),
          gross_sales: Number(point.gross_sales ?? 0),
          cogs: Number(point.cogs ?? 0),
          gross_profit: Number(point.gross_profit ?? 0)
        });
      });
      chartSheet.getRow(1).eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
      });
      chartSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          [2, 3, 4, 5, 6].forEach((col) => {
            row.getCell(col).numFmt = currencyFormat;
          });
        }
      });

      const trxSheet = workbook.addWorksheet("Recent Orders");
      trxSheet.columns = [
        { header: "Order", key: "order", width: 24 },
        { header: "Waktu", key: "time", width: 20 },
        { header: "Counter", key: "counter", width: 20 },
        { header: "Customer", key: "customer", width: 18 },
        { header: "Status", key: "status", width: 14 },
        { header: "Total Order", key: "total", width: 16 },
        { header: "App Fee", key: "app_fee", width: 16 },
        { header: "Gross Sales", key: "gross_sales", width: 16 },
        { header: "COGS", key: "cogs", width: 16 },
        { header: "Gross Profit", key: "gross_profit", width: 16 }
      ];
      analytics.recent_orders.forEach((trx) => {
        trxSheet.addRow({
          order: trx.order_number || `#${trx.id}`,
          time: trx.created_at ? new Date(trx.created_at).toLocaleString("id-ID") : "-",
          counter: trx.outlet?.name || "-",
          customer: trx.user?.name || "-",
          status: trx.status,
          total: Number(trx.total_price),
          app_fee: Number(trx.app_fee_est ?? (Number(trx.delivery_fee) + Number(trx.tax))),
          gross_sales: Number(trx.gross_sales_est ?? 0),
          cogs: Number(trx.cogs_est ?? 0),
          gross_profit: Number(trx.gross_profit_est ?? 0)
        });
      });
      trxSheet.getRow(1).eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
      });
      trxSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          [6, 7, 8, 9, 10].forEach((col) => {
            row.getCell(col).numFmt = currencyFormat;
          });
        }
      });
      trxSheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: Math.max(2, analytics.recent_orders.length + 1), column: 10 }
      };

      const excelBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      downloadFile(blob, `Laporan_Transaksi_${dateLabel.replace(/\s+/g, '_')}.xlsx`);
      
      toast.success("Berhasil mengunduh Excel!", { id: toastId });
    } catch (error) {
      console.error("Export Excel error:", error);
      toast.error("Gagal mengunduh file Excel.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Handler Export PDF
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const toastId = toast.loading("Menyiapkan file PDF...");

      const analytics = await getLatestAnalyticsForExport();
      setData(analytics);

      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();

      // Render Logo & Header
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.src = '/logo.png';
        img.onload = () => {
          doc.addImage(img, 'PNG', 14, 10, 22, 22);
          resolve();
        };
        img.onerror = () => resolve(); // Skip logo on error
      });

      const selectedOutletName = selectedOutletId === "all"
        ? "Semua Counter"
        : outlets.find((o) => o.id === selectedOutletId)?.name || `Outlet #${selectedOutletId}`;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Laporan & Analitik ZAD", 40, 16);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Periode: ${analytics.applied_filters?.start_date || dateRange.start || "-"} s/d ${analytics.applied_filters?.end_date || dateRange.end || "-"}`, 40, 23);
      doc.text(`Counter: ${selectedOutletName}`, 40, 28);

      const greenTheme = [21, 66, 60] as [number, number, number];

      autoTable(doc, {
        startY: 38,
        head: [["Metrik", "Nilai", "Pertumbuhan"]],
        headStyles: { fillColor: greenTheme },
        body: [
          ["Total Omzet Bruto", analytics.summary.revenue.value.toLocaleString("id-ID"), `${analytics.summary.revenue.growth}%`],
          ["Pendapatan Bersih (Fee)", analytics.summary.net_income.value.toLocaleString("id-ID"), `${analytics.summary.net_income.growth}%`],
          ["Total Penjualan", analytics.summary.gross_sales.value.toLocaleString("id-ID"), `${analytics.summary.gross_sales.growth}%`],
          ["HPP / Modal", analytics.summary.cogs.value.toLocaleString("id-ID"), `${analytics.summary.cogs.growth}%`],
          ["Laba Kotor", analytics.summary.gross_profit.value.toLocaleString("id-ID"), `${analytics.summary.gross_profit.growth}%`],
          ["Persentase Laba", `${Number(analytics.summary.gross_margin_percent.value).toFixed(2)}%`, "-"],
          ["Total Transaksi", analytics.summary.orders.value.toLocaleString("id-ID"), `${analytics.summary.orders.growth}%`],
          ["Total Item Terjual", analytics.summary.total_items_sold.value.toLocaleString("id-ID"), "-"],
          ["Refund / Batal", analytics.summary.refund.value.toLocaleString("id-ID"), `${analytics.summary.refund.growth}%`]
        ]
      });

      const previousTableY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 38;

      autoTable(doc, {
        startY: previousTableY + 8,
        head: [["ID Order", "Status", "Total", "App Fee", "Total Penjualan", "HPP / Modal", "Laba Kotor"]],
        headStyles: { fillColor: greenTheme },
        body: analytics.recent_orders.slice(0, 20).map((trx) => [
          trx.order_number || `#${trx.id}`,
          trx.status,
          Number(trx.total_price).toLocaleString("id-ID"),
          Number(trx.app_fee_est ?? (Number(trx.delivery_fee) + Number(trx.tax))).toLocaleString("id-ID"),
          Number(trx.gross_sales_est ?? 0).toLocaleString("id-ID"),
          Number(trx.cogs_est ?? 0).toLocaleString("id-ID"),
          Number(trx.gross_profit_est ?? 0).toLocaleString("id-ID")
        ])
      });

      const pdfBlob = doc.output("blob");
      const blob = new Blob([pdfBlob], { type: "application/pdf" });
      downloadFile(blob, `Laporan_Transaksi_${dateLabel.replace(/\s+/g, '_')}.pdf`);
      
      toast.success("Berhasil mengunduh PDF!", { id: toastId });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 501) {
        toast.error("Fitur PDF belum diaktifkan di server (DOMPDF missing).", { duration: 4000 });
      } else {
        toast.error("Gagal mengunduh file PDF.");
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Data Mapping untuk Stat Cards
  const formatGrowth = (growth: number | null | undefined) => {
    if (growth === null || growth === undefined || Number.isNaN(growth)) return undefined;
    return `${growth}%`;
  };

  const stats: ReportStatUI[] = data ? [
    {
      label: "TOTAL OMZET BRUTO",
      value: `Rp ${data.summary.revenue.value.toLocaleString("id-ID")}`,
      trend: formatGrowth(data.summary.revenue.growth),
      isPositive: data.summary.revenue.growth >= 0,
      icon: "money"
    },
    {
      label: "PENDAPATAN BERSIH (FEE)",
      value: `Rp ${data.summary.net_income.value.toLocaleString("id-ID")}`,
      trend: formatGrowth(data.summary.net_income.growth),
      isPositive: data.summary.net_income.growth >= 0,
      icon: "wallet"
    },
    {
      label: "TOTAL PENJUALAN",
      value: `Rp ${data.summary.gross_sales.value.toLocaleString("id-ID")}`,
      trend: formatGrowth(data.summary.gross_sales.growth),
      isPositive: data.summary.gross_sales.growth >= 0,
      icon: "money"
    },
    {
      label: "HPP / MODAL",
      value: `Rp ${data.summary.cogs.value.toLocaleString("id-ID")}`,
      trend: formatGrowth(data.summary.cogs.growth),
      isPositive: data.summary.cogs.growth <= 0,
      icon: "cost"
    },
    {
      label: "LABA KOTOR",
      value: `Rp ${data.summary.gross_profit.value.toLocaleString("id-ID")}`,
      trend: formatGrowth(data.summary.gross_profit.growth),
      isPositive: data.summary.gross_profit.growth >= 0,
      icon: "profit"
    },
    {
      label: "PERSENTASE LABA",
      value: `${Number(data.summary.gross_margin_percent.value).toFixed(2)}%`,
      trend: formatGrowth(data.summary.gross_margin_percent.growth),
      isPositive: true,
      icon: "margin"
    },
    {
      label: "TOTAL TRANSAKSI",
      value: `${data.summary.orders.value} Order`,
      trend: formatGrowth(data.summary.orders.growth),
      isPositive: data.summary.orders.growth >= 0,
      icon: "order"
    },
    {
      label: "TOTAL ITEM TERJUAL",
      value: `${data.summary.total_items_sold.value.toLocaleString("id-ID")} Item`,
      trend: formatGrowth(data.summary.total_items_sold.growth),
      isPositive: true,
      icon: "items"
    },
    {
      label: "REFUND / BATAL",
      value: `Rp ${data.summary.refund.value.toLocaleString("id-ID")}`,
      trend: formatGrowth(data.summary.refund.growth),
      isPositive: data.summary.refund.growth <= 0, // Refund growth negatif itu bagus
      icon: "cancel"
    }
  ] : [];

  return (
    <>
      <AdminHeader title="Laporan & Analitik" onRefresh={handleRefresh} />

      <main className="p-8 pb-32 space-y-8 animate-in fade-in duration-500 bg-surface-300 min-h-screen">
        
        {/* Header & Toolbar Area */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
           <div>
             <h1 className="text-2xl font-bold text-neutral-900">Laporan Keuangan</h1>
             <p className="text-sm text-neutral-500 mt-1">Analisa pendapatan, transaksi, dan performa bisnis.</p>
           </div>
           
           <ReportToolbar 
              onDateChange={handleDateChange} 
              onOutletChange={handleOutletChange}
              dateLabel={dateLabel}
              selectedOutletId={selectedOutletId}
              outlets={outlets}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
              isExportingExcel={isExportingExcel}
              isExportingPdf={isExportingPdf}
           />
        </div>

        {/* Content Area */}
        {isLoading ? (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-[#15423C]" size={50} />
            </div>
        ) : data ? (
            <>
                <ReportStatCards stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-1">
                      <RevenueChart data={data.chart} />
                   </div>
                   <div className="lg:col-span-2 h-full">
                      <TransactionTable transactions={data.recent_orders} />
                   </div>
                </div>
            </>
        ) : (
            <div className="text-center py-20 text-neutral-400">
                Gagal memuat data laporan.
            </div>
        )}

      </main>
    </>
  );
}
