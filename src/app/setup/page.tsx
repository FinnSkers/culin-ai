import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to CulinAI!</CardTitle>
          <CardDescription>
            Just one more step to get your AI kitchen assistant running.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Configuration Required</AlertTitle>
            <AlertDescription>
              Your application needs to connect to a Supabase project and Google AI to function. Please provide the necessary credentials.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 text-sm">
            <p>
              1. In the root directory of your project, create a new file named <code className="font-mono text-primary bg-muted px-1 py-0.5 rounded">.env.local</code>
            </p>
            <p>
              2. Open the file and paste the following content, replacing the placeholder values with your actual keys.
            </p>
            
            <div className="p-4 bg-muted rounded-md text-foreground overflow-x-auto">
              <pre className="text-xs sm:text-sm">
                <code>
                  {`# Supabase Credentials (from Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE

# Google AI Credentials (from https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE
`}
                </code>
              </pre>
            </div>

            <p>
              3. After saving the <code className="font-mono text-primary bg-muted px-1 py-0.5 rounded">.env.local</code> file, you will need to **restart your development server** for the changes to apply.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
