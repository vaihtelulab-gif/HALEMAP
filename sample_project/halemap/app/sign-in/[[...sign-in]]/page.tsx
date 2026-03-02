import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          halemapにログイン
        </h1>
        <div className="flex justify-center">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
