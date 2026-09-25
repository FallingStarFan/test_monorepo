import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服務條款 | 星凡工作室',
  robots: { index: false, follow: false }, // 草稿期間先不要收錄；正式上線後移除
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-foreground">
      <h1 className="text-3xl font-bold">服務條款</h1>
      <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        本頁仍為草稿，尚有資料待確認，請勿作為正式政策發布。
      </p>
      <article className="mt-8 text-sm text-muted-foreground sm:text-base">
      <p className="mt-4 leading-7">生效日期：【待填】</p>
      <p className="mt-4 leading-7">歡迎使用星凡工作室（xingfan-studio，下稱「本服務」）。本服務由【經營者可識別名稱待填】提供。註冊或使用前，請閱讀本條款及隱私權政策；若不同意，請停止使用。</p>
      <h2 className="mt-10 text-xl font-semibold">1. 服務與帳號</h2>
      <p className="mt-4 leading-7">本服務提供帳號、內容建立、上傳、分享及 AI 相關功能；實際可用項目以網站介面為準。您應提供合法且適當的帳號資訊，妥善保管登入憑證，並就帳號下的活動負責。若發現未經授權使用，請聯絡【聯絡信箱待填】。您可透過 Google、GitHub 或帳號密碼登入；第三方登入服務亦適用各自的規則。</p>
      <h2 className="mt-10 text-xl font-semibold">2. 使用者內容與權利</h2>
      <p className="mt-4 leading-7">您保有自己合法擁有的內容權利，並應確保上傳、輸入及分享的資料有相應權限。為提供儲存、顯示、分享及處理等功能，您授權本服務在提供服務所需範圍內儲存、複製、傳輸、呈現及處理該內容。此授權不代表本服務取得內容所有權。公開分享的內容可能由他人檢視、保存或轉傳；刪除後也未必能撤回他人已取得的副本。</p>
      <h2 className="mt-10 text-xl font-semibold">3. 使用限制</h2>
      <p className="mt-4 leading-7">請勿使用本服務侵害他人權利、未經允許蒐集或公開他人個資、散布惡意程式、試圖繞過安全限制、干擾服務、違反適用法律，或上傳您無權處理的內容。若內容涉及違法或侵權申訴，我們可能在合理範圍內限制存取、移除內容或停用帳號，並提供【申訴與復查管道待填】。</p>
      <h2 className="mt-10 text-xl font-semibold">4. AI 功能</h2>
      <p className="mt-4 leading-7">AI 產出可能不準確、不完整或與他人內容相似；使用前請自行核對。使用者應確認輸入資料具有處理權限，並依用途評估產出的適法性。若 AI 功能涉及外部供應商，資料處理方式以隱私權政策揭露為準。【待確認 AI 產出使用權限、第三方模型條款與禁止用途】。</p>
      <h2 className="mt-10 text-xl font-semibold">5. 費用與功能變更</h2>
      <p className="mt-4 leading-7">目前本服務免費。未來若推出付費功能，我們會在購買前揭露價格、幣別、計費週期、取消與退款規則，並依適用規定處理；不會僅憑本條款對現有使用者自動收費。服務可能因維護、安全或功能調整暫時中斷或變更；如有重大影響，會以適當方式通知。</p>
      <h2 className="mt-10 text-xl font-semibold">6. 帳號停用與終止</h2>
      <p className="mt-4 leading-7">您可依【帳號刪除操作路徑待填】停止使用或請求刪除帳號。我們得在合理必要範圍內對違反本條款、影響他人權益或服務安全的使用進行處置。資料的刪除、備份與依法保留方式請見隱私權政策。</p>
      <h2 className="mt-10 text-xl font-semibold">7. 責任、爭議與聯絡</h2>
      <p className="mt-4 leading-7">本服務將盡合理努力維持功能與安全；對於服務中斷、使用者內容或 AI 產出所生爭議，依適用法律及實際責任處理。本條款不限制您依法享有、不得事先排除的權利。準據法與爭議處理方式：【待確認經營所在地、服務對象與適用法律後填寫】。相關問題請聯絡：【聯絡信箱待填】。</p>
      </article>
    </main>
  );
}
