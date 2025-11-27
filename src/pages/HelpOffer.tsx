import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, MapPin } from 'lucide-react';

const SERVICE_TYPES = [
  'ทำความสะอาด',
  'ซ่อมแซม',
  'ขับรถ/ขนส่ง',
  'ทำอาหาร',
  'บริจาคเงิน',
  'บริจาคสิ่งของ',
  'ให้คำปรึกษา',
  'อาสาทั่วไป',
  'อื่นๆ'
];

export default function HelpOffer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    servicesOffered: [] as string[],
    capacity: '',
    contactInfo: '',
    contactMethod: '',
    availability: '',
    locationArea: '',
    skills: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.contactInfo) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('help_offers')
        .insert({
          name: formData.name,
          description: formData.description,
          services_offered: formData.servicesOffered,
          capacity: formData.capacity || null,
          contact_info: formData.contactInfo,
          contact_method: formData.contactMethod || null,
          availability: formData.availability || null,
          location_area: formData.locationArea || null,
          skills: formData.skills || null
        });

      if (error) throw error;

      toast.success('บันทึกข้อเสนอความช่วยเหลือเรียบร้อยแล้ว');
      navigate('/help-browse');
    } catch (error) {
      console.error('Error creating help offer:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
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
            เสนอให้ความช่วยเหลือ
          </h1>
          <p className="text-muted-foreground mb-6">
            โปรดกรอกรายละเอียดความช่วยเหลือที่คุณสามารถให้ได้
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ชื่อ / นามแฝง <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อหรือนามแฝงของคุณ"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                รายละเอียดการให้ความช่วยเหลือ <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายความช่วยเหลือที่คุณสามารถให้ได้..."
                rows={6}
                required
              />
            </div>

            {/* Services Offered */}
            <div>
              <label className="block text-sm font-medium mb-3">
                ประเภทความช่วยเหลือที่สามารถให้ได้
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SERVICE_TYPES.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.servicesOffered.includes(service)}
                      onCheckedChange={() => toggleService(service)}
                    />
                    <label
                      htmlFor={service}
                      className="text-sm cursor-pointer"
                    >
                      {service}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ความสามารถ / จำนวนคน / ทรัพยากร
              </label>
              <Input
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="เช่น: 3 คน, มีรถกระบะ 1 คัน"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ทักษะพิเศษ / อุปกรณ์
              </label>
              <Input
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="เช่น: ช่างไฟฟ้า, มีเครื่องสูบน้ำ"
              />
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ข้อมูลติดต่อ <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="เบอร์โทร, LINE ID, Facebook"
                required
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

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ช่วงเวลาที่สะดวก
              </label>
              <Input
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="เช่น: ทุกวันเสาร์-อาทิตย์, 18:00-20:00 น."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                พื้นที่ที่สามารถช่วยได้
              </label>
              <Input
                value={formData.locationArea}
                onChange={(e) => setFormData({ ...formData, locationArea: e.target.value })}
                placeholder="เช่น: เชียงใหม่, หาดใหญ่"
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {loading ? 'กำลังบันทึก...' : 'ส่งข้อเสนอความช่วยเหลือ'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
