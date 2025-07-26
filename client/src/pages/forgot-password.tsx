import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Mail, Key } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordData, type ResetPasswordData } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

type Step = 'email' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const emailForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<{ password: string }>({
    resolver: zodResolver(resetPasswordSchema.omit({ token: true })),
  });

  const onSubmitEmail = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      const token = await forgotPassword(data.email);
      setResetToken(token);
      setStep('reset');
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para continuar.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao enviar email',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data: { password: string }) => {
    setIsLoading(true);
    try {
      await resetPassword(resetToken, data.password);
      setStep('success');
      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi alterada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao alterar senha',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl text-center">Esqueci minha senha</CardTitle>
        <CardDescription className="text-center">
          Digite seu email para receber instruções de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                {...emailForm.register('email')}
              />
            </div>
            {emailForm.formState.errors.email && (
              <Alert variant="destructive">
                <AlertDescription>{emailForm.formState.errors.email.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Enviar instruções
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login">
            <Button variant="link" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Button>
          </Link>
        </div>
      </CardContent>
    </>
  );

  const renderResetStep = () => (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl text-center">Nova senha</CardTitle>
        <CardDescription className="text-center">
          Digite sua nova senha abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...resetForm.register('password')}
              />
            </div>
            {resetForm.formState.errors.password && (
              <Alert variant="destructive">
                <AlertDescription>{resetForm.formState.errors.password.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Alterando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Alterar senha
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <CardHeader className="space-y-1 pb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Senha alterada!</CardTitle>
        <CardDescription className="text-center">
          Sua senha foi alterada com sucesso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/login">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <div className="flex items-center gap-2">
              Fazer login
              <ArrowRight className="h-4 w-4" />
            </div>
          </Button>
        </Link>
      </CardContent>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-orange-600 to-red-600 rounded"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI CRM</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Recuperação de senha</p>
        </div>

        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          {step === 'email' && renderEmailStep()}
          {step === 'reset' && renderResetStep()}
          {step === 'success' && renderSuccessStep()}
        </Card>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          © 2025 AI CRM. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}