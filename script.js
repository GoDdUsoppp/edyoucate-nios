const faqData = [
    {
        q: "શું NIOS બોર્ડની માર્કશીટ સરકારી નોકરી માટે માન્ય છે?",
        a: "હા, NIOS એ ભારત સરકારના શિક્ષણ મંત્રાલય દ્વારા સ્થાપિત છે, તેથી તેની માર્કશીટ તમામ સરકારી અને પ્રાઇવેટ નોકરીઓ માટે 100% માન્ય છે."
    },
    {
        q: "શું હું NIOS પછી NEET કે JEE ની પરીક્ષા આપી શકું?",
        a: "ચોક્કસ, NIOS ના વિદ્યાર્થીઓ NEET, JEE અને અન્ય તમામ નેશનલ લેવલની એન્ટ્રન્સ એક્ઝામ આપવા માટે સંપૂર્ણ પાત્ર છે."
    },
    {
        q: "TOC એટલે શું અને તેનો શો ફાયદો છે?",
        a: "TOC એટલે Transfer of Credit. જો તમે GSEB કે CBSE માં ફેલ થયા હોવ, તો તમારા પાસ થયેલા કોઈપણ બે વિષયના માર્ક્સ બેઠા NIOS માં ટ્રાન્સફર થઈ જશે. તમારે એ વિષયોની પરીક્ષા ફરીથી આપવી નહીં પડે."
    },
    {
        q: "પરીક્ષાઓ વર્ષમાં કેટલી વાર લેવાય છે?",
        a: "મુખ્ય પરીક્ષાઓ વર્ષમાં બે વાર (એપ્રિલ-મે અને ઓક્ટોબર-નવેમ્બર) લેવાય છે. આ સિવાય ઓન-ડીમાન્ડ એક્ઝામ પણ ઉપલબ્ધ હોય છે."
    },
    {
        q: "શું મારે રોજ ક્લાસમાં આવવું પડશે?",
        a: "ના, અમે 'Flexible Classes' ની સુવિધા આપીએ છીએ, જેથી તમે તમારી અનુકૂળતા મુજબ અભ્યાસનું આયોજન કરી શકો છો."
    },
    {
        q: "જો હું 10મા માં ક્યારેય ન ગયો હોવ, તો સીધું એડમિશન મળે?",
        a: "હા, જો તમારી ઉંમર 14 વર્ષથી વધુ હોય અને તમારી પાસે યોગ્ય આઈડી પ્રૂફ હોય, તો તમે સીધા 10મા ધોરણમાં પ્રવેશ મેળવી શકો છો."
    },
    {
        q: "એક્ઝામ સેન્ટર ક્યાં આવશે?",
        a: "તમારા એડ્રેસની નજીકમાં આવેલી કેન્દ્રીય વિદ્યાલયો અથવા સરકારી માન્ય સ્કૂલોમાં જ તમારું એક્ઝામ સેન્ટર આવે છે."
    },
    {
        q: "NIOS સર્ટિફિકેટથી પાસપોર્ટ કે વિઝા મળી શકે?",
        a: "હા, પાસપોર્ટ ઓફિસ અને વિદેશી એમ્બેસી (Visa Office) દ્વારા NIOS સર્ટિફિકેટ સંપૂર્ણ સ્વીકાર્ય છે."
    },
    {
        q: "સિલેબસ રેગ્યુલર બોર્ડ જેવો જ અઘરો હોય છે?",
        a: "ના, આનો સિલેબસ ઘણો વ્યવહારુ અને સરળ હોય છે, જેથી વિદ્યાર્થીઓ ઓછા સમયમાં સારો સ્કોર કરી શકે છે."
    },
    {
        q: "એડમિશન માટે કયા ડોક્યુમેન્ટ્સ જોઈએ?",
        a: "આધાર કાર્ડ, અગાઉની સ્કૂલનું લિવિંગ સર્ટિફિકેટ (LC), ફેઈલ થયેલી માર્કશીટ (જો હોય તો) અને પાસપોર્ટ સાઇઝનો ફોટો."
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Render FAQs
    const accordionContainer = document.getElementById('faqAccordion');
    
    faqData.forEach((faq, index) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        
        item.innerHTML = `
            <button class="accordion-header" id="faq-${index}">
                ${faq.q}
                <i class="fa-solid fa-chevron-down accordion-icon"></i>
            </button>
            <div class="accordion-body">
                <p>${faq.a}</p>
            </div>
        `;
        
        accordionContainer.appendChild(item);
    });

    // 2. Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const isActive = header.classList.contains('active');
            
            // Close all
            accordionHeaders.forEach(btn => {
                btn.classList.remove('active');
                btn.nextElementSibling.style.maxHeight = null;
            });
            
            // Open clicked if it wasn't active
            if (!isActive) {
                header.classList.add('active');
                body.style.maxHeight = body.scrollHeight + "px";
            }
        });
    });
    
    // Open the first FAQ by default
    if(accordionHeaders.length > 0) {
        accordionHeaders[0].click();
    }

    // 3. Form Submission (WhatsApp Redirect)
    const leadForm = document.getElementById('leadForm');
    
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('fullName').value;
        const mobile = document.getElementById('mobileNum').value;
        const className = document.querySelector('input[name="classSelect"]:checked')?.value;
        const board = document.querySelector('input[name="boardSelect"]:checked')?.value;
        
        // Build WhatsApp Message
        let message = `Hello edYOUcate, મને NIOS એડમિશન માટે વધુ માહિતી જોઈએ છે.\n\n`;
        message += `*Name:* ${name}\n`;
        message += `*Mobile:* ${mobile}\n`;
        message += `*Class:* ${className}\n`;
        message += `*Previous Board:* ${board}`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Replace with actual phone number (without +)
        const targetPhone = "919876543210"; 
        
        // Redirect to WhatsApp
        const waURL = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
        window.open(waURL, '_blank');
        
        // Reset form
        leadForm.reset();
    });
});
