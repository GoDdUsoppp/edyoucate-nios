document.addEventListener('DOMContentLoaded', () => {

    // 1. SMOOTH SCROLL REVEAL 
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.1, rootMargin: "0px 0px -30px 0px" };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // 2. NEW: INTERACTIVE TABS LOGIC
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding content
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. FULL FAQ DATA 
    const faqData = [
        { q: "Is the NIOS mark sheet valid for government jobs?", a: "Yes, NIOS is established by the Ministry of Education, Government of India. The mark sheet is 100% valid for all government and private sector jobs." },
        { q: "Can I appear for NEET or JEE after passing from NIOS?", a: "Absolutely! NIOS students are fully eligible to appear for NEET, JEE, and all other national-level entrance examinations." },
        { q: "What is TOC and how does it benefit me?", a: "TOC stands for Transfer of Credit. If you have failed in GSEB or CBSE, you can directly transfer the marks of up to two passed subjects into your NIOS mark sheet." },
        { q: "How many times a year are exams conducted?", a: "Major public exams are held twice a year (April-May and October-November). Additionally, On-Demand Exams (ODE) are available almost every month." },
        { q: "Do I need to attend classes every day?", a: "No, we provide 'Flexible Classes', allowing you to plan your studies from home according to your convenience without daily attendance." },
        { q: "If I have never attended 10th grade, can I get direct admission?", a: "Yes, if you are above 14 years of age and possess valid ID proof, you are eligible for direct admission to the 10th standard." },
        { q: "Where will my exam center be located?", a: "Your exam center will be allotted at a Kendriya Vidyalaya or government-recognized school close to your residential address." },
        { q: "Can I use the NIOS certificate for a Passport or Visa?", a: "Yes, the NIOS certificate is widely recognized and accepted globally by passport offices and foreign embassies." },
        { q: "Is the syllabus as tough as regular boards?", a: "No, the NIOS syllabus is designed to be highly practical, simplified, and student-friendly." },
        { q: "What documents are required for admission?", a: "You will need your Aadhar Card, previous school's Leaving Certificate (LC), failed mark sheet (if applicable), and a passport-size photograph." }
    ];

    // Render FAQs
    const accordionContainer = document.getElementById('faqAccordion');
    faqData.forEach((faq, index) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
            <button class="accordion-header" id="faq-${index}">
                ${faq.q} <i class="fa-solid fa-chevron-down accordion-icon"></i>
            </button>
            <div class="accordion-body"><p>${faq.a}</p></div>
        `;
        accordionContainer.appendChild(item);
    });

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const isActive = header.classList.contains('active');

            accordionHeaders.forEach(btn => {
                btn.classList.remove('active');
                btn.nextElementSibling.style.maxHeight = null;
            });

            if (!isActive) {
                header.classList.add('active');
                body.style.maxHeight = body.scrollHeight + "px";
            }
        });
    });
    if (accordionHeaders.length > 0) accordionHeaders[0].click();

    // 4. WHATSAPP LEAD FORM SUBMISSION
    const leadForm = document.getElementById('leadForm');
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('fullName').value;
        const mobile = document.getElementById('mobileNum').value;
        const className = document.getElementById('classSelect').value;

        let message = `*🔥 NEW LEAD FROM FUNNEL 🔥*\n\n`;
        message += `*Name:* ${name}\n*Mobile:* ${mobile}\n*Class:* ${className}\n`;
        message += `\nI am requesting a free consultation regarding NIOS admission.`;

        const encodedMessage = encodeURIComponent(message);
        const targetPhone = "919876543210";
        window.open(`https://wa.me/${targetPhone}?text=${encodedMessage}`, '_blank');
        leadForm.reset();
    });

    // 5. MINI EVERGREEN COUNTDOWN TIMER
    let countDownDate = new Date().getTime() + (14 * 60 * 60 * 1000) + (45 * 60 * 1000);
    setInterval(function () {
        let now = new Date().getTime();
        let distance = countDownDate - now;

        if (distance < 0) {
            countDownDate = new Date().getTime() + (14 * 60 * 60 * 1000);
            distance = countDownDate - now;
        }

        document.getElementById("hours").innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById("minutes").innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById("seconds").innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    }, 1000);
});