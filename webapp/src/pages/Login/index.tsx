import { useState, useCallback, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../shared/context/AuthContext';
import { Button, Card, Input, Label, TextField } from '@heroui/react';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);
    const err = await login(username.trim(), password);
    if (err) setError(err);
    setLoading(false);
  }, [username, password, login]);

  return (
    <Card className="min-h-screen rounded-[35px] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">智能管家</h1>
          <p className="text-sm text-neutral-500 mt-1">请登录您的账户</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-4">
          <TextField value={username} onChange={(v) => setUsername(v)} isRequired>
            <Label>用户名</Label>
            <Input placeholder="请输入用户名" autoComplete="username" />
          </TextField>

          <TextField value={password} onChange={(v) => setPassword(v)} isRequired>
            <Label>密码</Label>
            <Input type="password" placeholder="请输入密码" autoComplete="current-password" />
          </TextField>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" isDisabled={loading || !username.trim() || !password}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
      </motion.div>
    </Card>
  );
}
