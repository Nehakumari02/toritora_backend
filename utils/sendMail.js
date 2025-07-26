const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

async function sendMail(addresses, subject, htmlBody) {
    const recipients = Array.isArray(addresses) ? addresses : [addresses];

    const result = await transporter.sendMail({
        from: `Toritora Team ${process.env.GMAIL_USER}`,
        to: recipients.join(', '),
        subject: subject,
        html: htmlBody
    });

    console.log(JSON.stringify(result, null, 4));
}

const sendWelcomeEmail = async (email,locale) => {
    const htmlBody = `
        <html>
            <head>
                <style>
                    :root {
                        --primary-color: hsl(35, 100%, 55%);
                        --secondary-color: hsl(174, 62%, 47%);
                    }

                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f9f9f9;
                    }

                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0;
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }

                    h1 {
                        color: hsl(35, 100%, 55%);
                        font-size: 28px;
                        margin-bottom: 20px;
                    }

                    h2 {
                        color: hsl(35, 100%, 55%);
                        font-size: 24px;
                        margin-bottom: 10px;
                    }

                    p {
                        color: #555;
                        font-size: 16px;
                        line-height: 1.6;
                    }

                    .cta-button {
                        background-color: hsl(35, 100%, 55%);
                        color: white;
                        padding: 12px 25px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;
                        margin-top: 20px;
                        text-align: center;
                    }

                    .cta-button:hover {
                        background-color: hsl(174, 62%, 47%);
                    }

                    .footer {
                        font-size: 14px;
                        color: #888;
                        margin-top: 30px;
                        text-align: center;
                    }

                    .footer a {
                        color: hsl(174, 62%, 47%);
                        text-decoration: none;
                    }

                    .poster {
                        color: hsl(35, 100%, 55%);
                        height: 300px;
                        font-size: 32px;
                        border-radius: 8px;
                    }

                    .poster-image {
                        height: 150px;
                        width: auto;
                        margin-right: 15px;
                    }

                    .poster-text {
                        font-size: 32px;
                        font-weight: bold;
                        color: hsl(35, 100%, 55%);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="welcom">${locale === "jn" ? "Toritoraへようこそ！" : "Welcome to Toritora!"}</h1>
                    <p>${locale === "jn" ? "こんにちは、" : "Hi there,"}</p>
                    <p>
                        ${locale === "jn"
                        ? "Toritoraへようこそ！写真やモデルとしてのキャリアのために、あなたに最適なシームレスでモダンなソリューションをご提供します。今すぐご利用を開始しましょう！"
                        : "We’re thrilled to welcome you to Toritora, where you’ll experience seamless and modern solutions tailored to your needs for your photography and modelling career. We’re excited for you to get started!"}
                    </p>

                    <h2>${locale === "jn" ? "始めましょう" : "Get Started"}</h2>
                    <p>
                        ${locale === "jn"
                        ? "Toritoraを最大限に活用するために、次のことをお勧めします："
                        : "To get the most out of Toritora, we suggest checking out the following:"}
                    </p>
                    <ul>
                        <li>${locale === "jn" ? "プラットフォームを探索する" : "Explore our platform"}</li>
                        <li>${locale === "jn" ? "設定をカスタマイズする" : "Customize your preferences"}</li>
                    </ul>

                    <p>
                        ${locale === "jn"
                        ? "下のボタンをクリックして、Toritoraでの新しい旅を始めましょう！"
                        : "Click the button below to dive into your new journey with Toritora!"}
                    </p>
                    <a href="#" class="cta-button">${locale === "jn" ? "今すぐ始める" : "Start Now"}</a>

                    <div class="footer">
                        <p>
                            ${locale === "jn"
                                ? 'ご不明な点がございましたら、<a href="mailto:support@toritora.com">サポートチーム</a>までお気軽にご連絡ください。'
                                : 'If you have any questions, feel free to <a href="mailto:support@toritora.com">contact our support team</a>.'}
                        </p>
                        <p>
                            ${locale === "jn" ? "よろしくお願いいたします。<br>Toritoraチーム" : "Best regards,<br>The Toritora Team"}
                        </p>
                    </div>
                </div>
                <div class="container poster">
                    <img src="https://drive.google.com/uc?export=view&id=10a0sWZh5PxZDvga6znnEmtkP2VMaoaxl" alt="Toritora" class="poster-image" />
                </div>
            </body>
        </html>
    `;

    await sendMail(email, locale === "jn" ? "Toritoraへようこそ！" : "Welcome to Toritora!", htmlBody);
}

module.exports = {
    sendMail,
    sendWelcomeEmail
};
