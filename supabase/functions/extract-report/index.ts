import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawMessage } = await req.json();
    
    if (!rawMessage || typeof rawMessage !== 'string') {
      return new Response(
        JSON.stringify({ error: 'กรุณาระบุข้อความที่ต้องการประมวลผล' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing message extraction...');

    const systemPrompt = `You are an expert Thai language data extraction specialist for flood disaster victim information.

🚨 CRITICAL RULES - ABSOLUTE ZERO HALLUCINATION POLICY:
1. Extract ONLY information that is EXPLICITLY stated in the raw message
2. NEVER infer, assume, guess, or generate any information
3. If information is not clearly present, use empty values (empty string "", empty array [], or 0)
4. NEVER add example data, placeholder text, or explanatory notes
5. This is a life-critical disaster relief system - accuracy is PARAMOUNT

URGENCY LEVEL CLASSIFICATION (urgency_level):
Level 1: Not flooded yet / warning only
Level 2: Adults only, no children/seniors, ground floor flooded
Level 3: Has children OR seniors, OR water reached second floor
Level 4: Very young children (<3 years) OR people unable to self-rescue, not yet critical
Level 5: CRITICAL - water at roof level, infants, elderly unable to self-rescue, OR medical emergency

EXTRACTION GUIDELINES:
- reporter_name: Extract from social media profile name or signature in message (empty if not present)
- last_contact_at: Only if explicitly stated like "วันที่ 22", "6ชม." etc. Convert to readable format (empty if not present)
- name/lastname: Only if clearly stated (empty if not present)
- address: Copy exact address from message, preserve all details (empty if not present)
- phone: Array of phone numbers only if present (empty array if not present)
- location_lat/location_long: Only if GPS coordinates given (empty if not present)
- number_of_adults/children/seniors: Count only if explicitly stated (0 if not present)
- health_condition: Only mention if health issues are stated like "ป่วย", "โรคหัวใจ" (empty if not present)
- help_needed: Only if specifically requested like "ต้องการเรือ", "ขาดอาหาร" (empty if not present)
- additional_info: Other important details not covered above (empty if not present)

EXAMPLE OF CORRECT EXTRACTION:
Input: "คุณนิด 087-123-4567 บ้านเลขที่ 123 หมู่ 5 ต.แม่กา อ.เมือง จ.เชียงใหม่ มีผู้สูงอายุ 2 คน เด็ก 1 คน น้ำท่วมชั้นสอง"
Output: {
  name: "นิด",
  phone: ["087-123-4567"],
  address: "บ้านเลขที่ 123 หมู่ 5 ต.แม่กา อ.เมือง จ.เชียงใหม่",
  number_of_seniors: 2,
  number_of_children: 1,
  urgency_level: 3,
  (all other fields empty)
}

REMEMBER: When in doubt, leave it empty. Wrong data is worse than no data in a disaster relief system.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `แยกข้อมูลจากข้อความนี้:\n\n${rawMessage}` }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_report_data',
              description: 'แยกข้อมูลผู้ประสบภัยจากข้อความ',
              parameters: {
                type: 'object',
                properties: {
                  reporter_name: { 
                    type: 'string', 
                    description: 'ชื่อของผู้รายงาน/แจ้งเรื่อง ที่มาจากชื่อโปรไฟล์หรือลายเซ็นในข้อความ' 
                  },
                  last_contact_at: { 
                    type: 'string', 
                    description: 'วันเวลาที่ติดต่อล่าสุด ในรูปแบบ ISO 8601 (ถ้ามีระบุ เช่น "วันที่ 22" "เมื่อวาน")' 
                  },
                  name: { 
                    type: 'string', 
                    description: 'ชื่อของผู้ประสบภัย' 
                  },
                  lastname: { 
                    type: 'string', 
                    description: 'นามสกุลของผู้ประสบภัย' 
                  },
                  address: { 
                    type: 'string', 
                    description: 'ที่อยู่แบบละเอียด รวมหมู่บ้าน ซอย ถนน ตำบล อำเภอ จังหวัด' 
                  },
                  location_lat: { 
                    type: 'string', 
                    description: 'ละติจูด (ถ้ามี)' 
                  },
                  location_long: { 
                    type: 'string', 
                    description: 'ลองติจูด (ถ้ามี)' 
                  },
                  phone: { 
                    type: 'array',
                    items: { type: 'string' },
                    description: 'เบอร์โทรศัพท์ทั้งหมด' 
                  },
                  number_of_adults: { 
                    type: 'integer', 
                    description: 'จำนวนผู้ใหญ่' 
                  },
                  number_of_children: { 
                    type: 'integer', 
                    description: 'จำนวนเด็ก (อายุต่ำกว่า 18 ปี)' 
                  },
                  number_of_seniors: { 
                    type: 'integer', 
                    description: 'จำนวนผู้สูงอายุ (อายุมากกว่า 60 ปี)' 
                  },
                  health_condition: { 
                    type: 'string', 
                    description: 'ภาวะสุขภาพพิเศษ เช่น ป่วย พิการ ติดเตียง' 
                  },
                  help_needed: { 
                    type: 'string', 
                    description: 'ความช่วยเหลือที่ต้องการ เช่น เรือ อาหาร น้ำดื่ม ยา' 
                  },
                  additional_info: { 
                    type: 'string', 
                    description: 'ข้อมูลเพิ่มเติมที่สำคัญอื่นๆ ที่ควรบันทึก' 
                  },
                  urgency_level: { 
                    type: 'integer', 
                    description: 'ระดับความเร่งด่วน 1-5 ตามเกณฑ์ที่กำหนด'
                  }
                },
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_report_data' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'ระบบกำลังใช้งานหนัก กรุณาลองใหม่อีกครั้ง' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'ระบบต้องเติมเครดิต กรุณาติดต่อผู้ดูแลระบบ' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    // Extract all function calls (multiple reports from one message)
    const toolCalls = data.choices?.[0]?.message?.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      throw new Error('No function call in AI response');
    }

    // Process all extracted reports
    const extractedReports = toolCalls.map((toolCall: any) => {
      const extractedData = JSON.parse(toolCall.function.arguments);
      
      return {
        ...extractedData,
        raw_message: rawMessage,
        // Set defaults for optional fields - use empty string instead of examples
        reporter_name: extractedData.reporter_name || '',
        last_contact_at: extractedData.last_contact_at || '',
        lastname: extractedData.lastname || '',
        location_lat: extractedData.location_lat || '',
        location_long: extractedData.location_long || '',
        phone: extractedData.phone || [],
        number_of_adults: extractedData.number_of_adults || 0,
        number_of_children: extractedData.number_of_children || 0,
        number_of_seniors: extractedData.number_of_seniors || 0,
        health_condition: extractedData.health_condition || '',
        help_needed: extractedData.help_needed || '',
        additional_info: extractedData.additional_info || '',
        name: extractedData.name || '',
        address: extractedData.address || '',
        urgency_level: extractedData.urgency_level || 1,
      };
    });

    console.log('Extracted reports:', extractedReports);

    return new Response(
      JSON.stringify({ 
        reports: extractedReports,
        count: extractedReports.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-report function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});