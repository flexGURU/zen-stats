package pkg

import (
	"bytes"
	"html/template"
)

// containt email and sms templates
const (
	ResetPasswordTemplate = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
			<h2 style="color: #007BFF; text-align: center;">Password Reset Request</h2>
			<p style="font-size: 16px; color: #333;">
				Hello <strong>{{.Name}}</strong>,
			</p>
			<p style="font-size: 15px; color: #555; line-height: 1.5;">
				We received a request to reset your password. If this was you, click the button below to create a new one. 
				If you didn’t request a password reset, you can safely ignore this email.
			</p>

			<p style="text-align: center; margin: 30px 0;">
				<a href="{{.Link}}" 
					style="display:inline-block; padding:12px 24px; background-color:#007BFF; color:#fff; 
					font-size:16px; text-decoration:none; border-radius:6px; font-weight:bold;">
					Reset Password
				</a>
			</p>

			<p style="font-size: 14px; color: #555;">
				This link will remain valid for <strong>{{.Valid}} minutes</strong>. 
				For your security, the link can only be used once.
			</p>

			<hr style="margin: 30px 0; border:none; border-top:1px solid #eaeaea;">
			<p style="font-size: 13px; color: #888; text-align: center;">
				Zen App • Security Team<br/>
				If you have any issues, contact our support team at 
				<a href="mailto:emiliocliff@gmail.com" style="color:#007BFF;">emiliocliff@gmail.com</a>.
			</p>
		</div>
	`
	InviteUserTemplate = `
		<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
			<h2 style="color: #007BFF;">Welcome to Zen App!</h2>
			<p>Hello <strong>{{.FullName}}</strong>,</p>
			<p>You have been invited to join the <strong>Zen App</strong>
			
			<p>To get started, please set your password and activate your account by clicking the button below:</p>
			
			<p style="text-align: center; margin: 30px 0;">
			<a href="{{.InviteLink}}" style="display:inline-block; padding:12px 24px; background-color:#007BFF; color:#fff; font-size:16px; text-decoration:none; border-radius:6px;">Accept Invitation</a>
			</p>
			
			<hr style="margin: 30px 0; border:none; border-top:1px solid #eaeaea;">
			<p style="font-size:14px; color:#888;">This invitation was sent to <strong>{{.Email}}</strong>. If you were not expecting this, you can safely ignore this email.</p>
		</div>
	`
)

func GenerateText(title, templateTxt string, payload any) (string, error) {
	tmpl, err := template.New(title).Parse(templateTxt)
	if err != nil {
		return "", Errorf(INTERNAL_ERROR, "failed creating template: %s", err.Error())
	}

	var msgBuffer bytes.Buffer
	if err := tmpl.Execute(&msgBuffer, payload); err != nil {
		return "", Errorf(INTERNAL_ERROR, "failed executing template: %s", err.Error())
	}

	return msgBuffer.String(), nil
}
