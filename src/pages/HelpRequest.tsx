import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';

const HELP_TYPES = [
  'น้ำ/อาหาร',
  'ยา/เวชภัณฑ์',
  'เสื้อผ้า',
  'ที่พักพิง',
  'อพยพ',
  'ซ่อมแซม',
  'แรงงาน',
  'เงินช่วยเหลือ',
  'อื่นๆ'
];

export default function HelpRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    helpTypes: [] as string[],
    budget: '',
    contactName: '',
    contactPhone: '',
    contactMethod: '',
    locationAddress: '',
    imageFiles: [] as File[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.contactName) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setLoading(true);
    try {
      const phones = formData.contactPhone.split(',').map(p => p.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('help_requests')
        .insert({
          title: formData.title,
          description: formData.description,
          help_types: formData.helpTypes,
          budget: formData.budget || null,
          contact_name: formData.contactName,
          contact_phone: phones.length > 0 ? phones : null,
          contact_method: formData.contactMethod || null,
          location_address: formData.locationAddress || null
        });

      if (error) throw error;

      toast.success('บันทึกคำขอความช่วยเหลือเรียบร้อยแล้ว');
      navigate('/help-browse');
    } catch (error) {
      console.error('Error creating help request:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const toggleHelpType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      helpTypes: prev.helpTypes.includes(type)
        ? prev.helpTypes.filter(t => t !== type)
        : [...prev.helpTypes, type]
    }));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับหน้าหลัก
        </Button>

        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            ขอความช่วยเหลือ
          </h1>
          <p className="text-muted-foreground mb-6">
            โปรดกรอกรายละเอียดความต้องการความช่วยเหลือของคุณ
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                หัวข้อ / สรุปสั้นๆ <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="เช่น: บ้านท่วมน้ำ ต้องการอาหารและน้ำดื่ม"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                รายละเอียด <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายสถานการณ์และความต้องการของคุณโดยละเอียด..."
                rows={6}
                required
              />
            </div>

            {/* Help Types */}
            <div>
              <label className="block text-sm font-medium mb-3">
                ประเภทความช่วยเหลือที่ต้องการ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HELP_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.helpTypes.includes(type)}
                      onCheckedChange={() => toggleHelpType(type)}
                    />
                    <label
                      htmlFor={type}
                      className="text-sm cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium mb-2">
                งบประมาณ / จำนวนเงินที่ต้องการ (ถ้ามี)
              </label>
              <Input
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="เช่น: 5,000 บาท"
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ชื่อผู้ติดต่อ <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="ชื่อ-นามสกุล"
                required
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                เบอร์โทรติดต่อ
              </label>
              <Input
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="08X-XXX-XXXX (คั่นด้วย , ถ้ามีหลายเบอร์)"
              />
            </div>

            {/* Contact Method */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ช่องทางติดต่อที่ต้องการ
              </label>
              <Input
                value={formData.contactMethod}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                placeholder="เช่น: โทรศัพท์, LINE, Facebook"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                ที่อยู่ / สถานที่
              </label>
              <Textarea
                value={formData.locationAddress}
                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                placeholder="ที่อยู่หรือสถานที่ที่ต้องการความช่วยเหลือ"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {loading ? 'กำลังบันทึก...' : 'ส่งคำขอความช่วยเหลือ'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
