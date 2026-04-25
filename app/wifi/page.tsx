import QRCode from "qrcode";
import { PrintButton } from "../cartaz/PrintButton";

export const dynamic = "force-static";

const WIFI_SSID = "FRODRIGUES";
const WIFI_PASSWORD = "05131612";
const WIFI_SECURITY = "WPA"; // WPA / WPA2 / WEP / nopass

// Escapa caracteres especiais conforme o padrão do payload Wi-Fi do QR
function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

async function generateQrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "H",
    color: { dark: "#2A2A2A", light: "#00000000" },
  });
}

export default async function WifiPage() {
  const payload = `WIFI:T:${WIFI_SECURITY};S:${escapeWifi(WIFI_SSID)};P:${escapeWifi(WIFI_PASSWORD)};;`;
  const qrSvg = await generateQrSvg(payload);

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .poster {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
        .poster {
          width: 210mm;
          min-height: 297mm;
          background:
            radial-gradient(60% 40% at 50% 0%, rgba(197, 104, 116, 0.10), transparent 70%),
            radial-gradient(60% 40% at 50% 100%, rgba(107, 124, 92, 0.10), transparent 70%),
            #FBF6EE;
        }
        .poster-frame {
          position: absolute;
          inset: 12mm;
          border: 1px solid rgba(107, 124, 92, 0.45);
        }
        .poster-frame-inner {
          position: absolute;
          inset: 14mm;
          border: 0.5px solid rgba(143, 63, 76, 0.35);
        }
      `}</style>

      <PrintButton />

      <div className="flex min-h-screen items-start justify-center bg-neutral-200 p-4 print:p-0 print:bg-white">
        <article className="poster relative shadow-2xl print:shadow-none">
          <div className="poster-frame" />
          <div className="poster-frame-inner" />

          <div className="relative flex h-full min-h-[297mm] flex-col items-center px-[20mm] pb-[18mm] pt-[32mm] text-center">
            {/* Topo */}
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-sage-dark">
              1º Aniversário
            </p>
            <h1 className="mt-2 font-script text-[88px] leading-none text-sage-dark">
              Anna Laura
            </h1>

            {/* Headline */}
            <div className="mt-7">
              <p className="font-script text-[56px] leading-none text-rose-dark">
                Conecte-se ao Wi-Fi
              </p>
              <p className="mt-3 font-serif text-[22px] font-medium italic text-ink">
                e fique à vontade
              </p>
            </div>

            {/* Instrução */}
            <p className="mt-7 max-w-[150mm] font-serif text-[18px] font-medium leading-snug text-ink">
              Aponte a câmera do seu celular para o QR Code abaixo
              e conecte automaticamente.
            </p>

            {/* QR Code */}
            <div className="mt-6 rounded-3xl border-2 border-sage/40 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(69,82,56,0.35)]">
              <div
                className="h-[68mm] w-[68mm]"
                aria-label={`QR Code Wi-Fi: rede ${WIFI_SSID}`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            {/* Rodapé */}
            <div className="mt-auto pt-6">
              <p className="font-script text-[40px] leading-none text-rose-dark">
                Com amor, Mamãe &amp; Papai
              </p>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
