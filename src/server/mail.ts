import nodemailer from "nodemailer";
import { env } from "~/env";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.SMTP_USER,
        pass: env.GOOGLE_APP_KEY_SMTP,
    },
});

export async function sendApplicationEmail(data: {
    name: string;
    email: string;
    mobileNumber: string;
    startupName: string;
    website?: string;
    pitchDeck?: string;
    overview: string;
    founderStage: string;
    primaryGoal: string;
    monthlyRevenue?: string;
    tier: string;
}) {
    // Collect recipients
    const recipients = [env.SMTP_USER];
    if (env.TEAM_EMAILS) {
        const extra = env.TEAM_EMAILS.split(",").map(e => e.trim()).filter(Boolean);
        recipients.push(...extra);
    }

    const tierColors: Record<string, string> = {
        Explorer: "#6366f1", // Indigo
        Visionary: "#a855f7", // Purple
        Trailblazer: "#d4af37", // Gold
    };

    const accentColor = tierColors[data.tier] ?? "#000";

    const mailOptions = {
        from: `"The Incite Crew" <${env.SMTP_USER}>`,
        to: recipients.join(", "),
        subject: `[New Application] ${data.name} — ${data.tier}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; color: #09090b; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #e4e4e7;">
                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 48px 40px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;">The Incite Crew</h1>
                            <p style="margin: 12px 0 0 0; color: #a1a1aa; font-size: 10px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;">New Membership Application</p>
                        </td>
                    </tr>
                    
                    <!-- CONTENT -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; background-color: ${accentColor}15; color: ${accentColor}; border: 1px solid ${accentColor}30;">
                                            ${data.tier} Tier
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td>
                                        <h2 style="margin: 0 0 16px 0; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #f4f4f5; padding-bottom: 12px;">Applicant Profile</h2>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Full Name</p>
                                        <p style="margin: 0; font-size: 15px; color: #09090b; font-weight: 500;">${data.name}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Email Address</p>
                                        <p style="margin: 0; font-size: 15px; color: #09090b; font-weight: 500;"><a href="mailto:${data.email}" style="color: #09090b; text-decoration: underline;">${data.email}</a></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Mobile Number</p>
                                        <p style="margin: 0; font-size: 15px; color: #09090b; font-weight: 500;">${data.mobileNumber}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Startup / Project Name</p>
                                        <p style="margin: 0; font-size: 15px; color: #09090b; font-weight: 500;">${data.startupName}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Website / Product Link</p>
                                        <p style="margin: 0; font-size: 15px; font-weight: 500;">
                                            ${data.website ? `<a href="${data.website}" style="color: #2563eb; text-decoration: none;">${data.website}</a>` : "<span style='color: #a1a1aa;'>Not provided</span>"}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Pitch Deck</p>
                                        <p style="margin: 0; font-size: 15px; font-weight: 500;">
                                            ${data.pitchDeck ? `<a href="${data.pitchDeck}" style="color: #2563eb; text-decoration: none;">View Pitch Deck &rarr;</a>` : "<span style='color: #a1a1aa;'>Not provided</span>"}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Project / Startup Overview</p>
                                        <div style="background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 8px; padding: 24px; font-size: 14px; color: #3f3f46; line-height: 1.6; border-left: 3px solid ${accentColor};">
                                            ${data.overview.replace(/\n/g, '<br>')}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Stage of Founder</p>
                                        <p style="margin: 0; font-size: 15px; color: #09090b; font-weight: 500;">${data.founderStage}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Primary Goal</p>
                                        <p style="margin: 0; font-size: 15px; color: #09090b; font-weight: 500;">${data.primaryGoal}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Monthly Revenue</p>
                                        <p style="margin: 0; font-size: 15px; color: #09090b; font-weight: 500;">${data.monthlyRevenue ?? "Not provided"}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- FOOTER -->
                    <tr>
                        <td align="center" style="background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 24px;">
                            <p style="margin: 0; color: #a1a1aa; font-size: 11px;">Securely processed by TIC Internal Systems.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendConfirmationEmail(data: {
    name: string;
    email: string;
    tier: string;
}) {
    const tierNames: Record<string, string> = {
        Explorer: "The Explorer Pathway",
        Visionary: "The Visionary System",
        Trailblazer: "The Trailblazer Partnership",
    };

    const mailOptions = {
        from: `"The Incite Crew" <${env.SMTP_USER}>`,
        to: data.email,
        subject: `Welcome to the process, ${data.name.split(' ')[0]}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #09090b; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <!-- LOGO HEADER -->
                    <tr>
                        <td align="center" style="padding: 64px 40px 32px 40px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;">The Incite Crew</h1>
                        </td>
                    </tr>
                    
                    <!-- CONTENT -->
                    <tr>
                        <td style="padding: 0 40px 48px 40px;">
                            <h2 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 400; color: #ffffff;">Application Received.</h2>
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                Hello ${data.name.split(' ')[0]},<br><br>
                                Thank you for your interest in joining the ecosystem.<br>
                                We have officially received your application for the <strong>${tierNames[data.tier] ?? data.tier}</strong> at The Incite Crew.
                            </p>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border-radius: 8px; border-left: 2px solid #ffffff;">
                                <tr>
                                    <td style="padding: 24px 32px;">
                                        <p style="margin: 0; font-size: 14px; color: #d4d4d8; line-height: 1.6;">
                                            Our team manually reviews every application to maintain a high signal-to-noise ratio within the network. You will hear back regarding your application status within 48&ndash;72 hours.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 32px 0 0 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                If your application is shortlisted, the next step will be a short conversation with our team to better understand your venture and goals.<br><br>
                                We appreciate you taking the time to apply and look forward to reviewing your submission.
                            </p>

                        </td>
                    </tr>
                    
                    <!-- FOOTER -->
                    <tr>
                        <td align="center" style="border-top: 1px solid #27272a; padding: 32px 40px;">
                            <p style="margin: 0; color: #52525b; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">
                                A clarity first ecosystem
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendReviewEmail(data: {
    name: string;
    email: string;
    tier: string;
}) {
    const tierNames: Record<string, string> = {
        Explorer: "The Explorer Pathway",
        Visionary: "The Visionary System",
        Trailblazer: "The Trailblazer Partnership",
    };

    const mailOptions = {
        from: `"The Incite Crew" <${env.SMTP_USER}>`,
        to: data.email,
        subject: `Your ${data.tier} Application is Being Reviewed`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #09090b; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="padding: 64px 40px 32px 40px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;">The Incite Crew</h1>
                        </td>
                    </tr>
                    
                    <!-- CONTENT -->
                    <tr>
                        <td style="padding: 0 40px 48px 40px;">
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                Hello ${data.name.split(' ')[0]},<br><br>
                                Your <strong>${tierNames[data.tier] ?? data.tier}</strong> application is currently being reviewed by our team.
                            </p>
                            
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                We will update you shortly once the review process is complete.
                            </p>

                            <p style="margin: 0; font-size: 15px; color: #71717a; line-height: 1.7;">
                                &mdash; The Incite Crew Team
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendDecisionEmail(data: {
    name: string;
    email: string;
    tier: string;
    decision: "accepted" | "rejected";
    calendlyLink?: string;
}) {
    const isAccepted = data.decision === "accepted";
    const subject = isAccepted
        ? `Next Steps: ${data.tier} Application`
        : `Update on your ${data.tier} Application`;

    const mailOptions = {
        from: `"The Incite Crew" <${env.SMTP_USER}>`,
        to: data.email,
        subject,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #09090b; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="padding: 64px 40px 32px 40px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;">The Incite Crew</h1>
                        </td>
                    </tr>
                    
                    <!-- CONTENT -->
                    <tr>
                        <td style="padding: 0 40px 48px 40px;">
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                Hello ${data.name.split(' ')[0]},
                            </p>
                            
                            ${isAccepted ? `
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                Your application has been shortlisted. The next step is a brief conversation with our team to better understand your venture and goals.
                            </p>
                            <div style="margin-top: 32px; margin-bottom: 32px;">
                                <a href="${data.calendlyLink ?? '#'}" style="display: inline-block; padding: 12px 24px; background-color: #ffffff; color: #000000; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 4px;">Schedule Conversation</a>
                            </div>
                            ` : `
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                Thank you for applying. After careful review, we are unable to move forward with your application for the ${data.tier} tier at this time.
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                We wish you the best in your journey and encourage you to apply again in the future as your venture evolves.
                            </p>
                            `}

                            <p style="margin: 0; font-size: 15px; color: #71717a; line-height: 1.7;">
                                Execute with intent,<br>
                                &mdash; The Incite Crew Team
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendCustomEmail(data: {
    name: string;
    email: string;
    subject: string;
    body: string;
}) {
    const mailOptions = {
        from: `"The Incite Crew" <${env.SMTP_USER}>`,
        to: data.email,
        subject: data.subject,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #09090b; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="padding: 48px 40px 32px 40px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;">The Incite Crew</h1>
                        </td>
                    </tr>

                    <!-- CONTENT -->
                    <tr>
                        <td style="padding: 0 40px 48px 40px;">
                            <p style="margin: 0 0 8px 0; font-size: 15px; color: #a1a1aa; line-height: 1.7;">
                                Hello ${data.name.split(' ')[0]},
                            </p>
                            <div style="margin-top: 24px; font-size: 15px; color: #a1a1aa; line-height: 1.8; white-space: pre-wrap;">
                                ${data.body.replace(/\n/g, '<br>')}
                            </div>
                            <p style="margin: 40px 0 0 0; font-size: 15px; color: #71717a; line-height: 1.7;">
                                &mdash; The Incite Crew Team
                            </p>
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td align="center" style="border-top: 1px solid #27272a; padding: 24px 40px;">
                            <p style="margin: 0; color: #52525b; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">
                                A clarity first ecosystem
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    };

    return transporter.sendMail(mailOptions);
}
