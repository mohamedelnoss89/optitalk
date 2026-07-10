'use client';

import { useState } from 'react';
import { Mail, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // الإيميل بتاعنا - مش بيظهر للمستخدم
  const CONTACT_EMAIL = 'optigroup.10@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('اكمل كل الحقول المطلوبة');
      return;
    }

    setIsSending(true);

    try {
      // نجهّز الـ mailto link - بيفتح برنامج الإيميل بتاع المستخدم
      // الـ to محدد لإيميلنا (مش ظاهر للمستخدم)
      const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[OptiCut] ${subject || 'رسالة جديدة'}`)}&body=${encodeURIComponent(`الاسم: ${name}\nالإيميل: ${email}\n\nالرسالة:\n${message}`)}`;

      window.location.href = mailtoLink;

      toast.success('تم فتح برنامج الإيميل - أرسل الرسالة من هناك');
      onOpenChange(false);

      // تنظيف الفورم
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('فشل الإرسال');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" />
            اتصل بنا
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-slate-300 text-xs">الاسم *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك"
              className="mt-1 bg-slate-800 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-slate-300 text-xs">الإيميل *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1 bg-slate-800 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-slate-300 text-xs">الموضوع</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="موضوع الرسالة"
              className="mt-1 bg-slate-800 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300 text-xs">الرسالة *</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="mt-1 bg-slate-800 border-white/10 text-white"
              rows={4}
              required
            />
          </div>

          <div className="bg-slate-800/50 rounded-lg p-2 text-[10px] text-slate-400 text-center">
            🔒 رسالتك ستُرسل مباشرة - لن يتم مشاركة بياناتك مع أي طرف ثالث
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSending}>
              <Send className="w-4 h-4 ml-1" />
              {isSending ? 'جاري الإرسال...' : 'إرسال'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
