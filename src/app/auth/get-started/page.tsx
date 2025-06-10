import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp appearance={{ variables: { colorPrimary: '#000000' } }} />
    </div>
  );
}