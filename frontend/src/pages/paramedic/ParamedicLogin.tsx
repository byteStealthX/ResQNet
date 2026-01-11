import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Ambulance, Phone, Hash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ParamedicLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'vehicle'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      toast({
        title: "OTP Sent",
        description: `Verification code sent to +91 ${phone}`,
      });
      setStep('otp');
    }
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      toast({
        title: "Phone Verified",
        description: "Please enter your vehicle number.",
      });
      setStep('vehicle');
    }
  };

  const handleStartShift = () => {
    if (vehicleNumber.length >= 10) {
      toast({
        title: "Shift Started!",
        description: `Welcome! Vehicle ${vehicleNumber} is now active.`,
      });
      navigate('/paramedic/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-info/10 rounded-2xl flex items-center justify-center mb-4">
            <Ambulance className="w-8 h-8 text-info" />
          </div>
          <h1 className="text-2xl font-bold">Paramedic Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to start your shift</p>
        </div>

        {/* Phone Step */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">+91</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-info-gradient text-info-foreground">
              <Phone className="w-4 h-4 mr-2" />
              Send OTP
            </Button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <Label>Enter Verification Code</Label>
              <p className="text-sm text-muted-foreground">
                Sent to +91 {phone}
              </p>
            </div>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOtpComplete}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep('phone')}
            >
              Change phone number
            </Button>
          </div>
        )}

        {/* Vehicle Step */}
        {step === 'vehicle' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Number</Label>
              <Input
                id="vehicle"
                placeholder="MH-01-AB-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="text-center font-mono text-lg"
              />
            </div>
            <Button
              onClick={handleStartShift}
              className="w-full h-14 text-lg font-bold bg-success-gradient text-success-foreground"
            >
              Start Shift
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
