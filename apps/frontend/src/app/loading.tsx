export default function Loading() {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 p-8">
      <img src="/loading.gif" alt="" className="h-16 w-16" />
      <span>載入中...</span>
    </div>
  );
}