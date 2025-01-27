from django.core.exceptions import ValidationError
import re

class CustomPasswordValidator:
	def __init__(self, min_length=9, max_length=20):
		self.min_length = min_length
		self.max_length = max_length

	def validate(self, password, user=None):
		if not password or len(password.strip()) == 0:
			raise ValidationError('password-empty-error')
		if len(password) < self.min_length:
			raise ValidationError('password-short-error')
		if len(password) > self.max_length:
			raise ValidationError('password-long-error')
		if not re.findall('[a-z]', password):
			raise ValidationError('password-lowercase-error')
		if not re.findall('[A-Z]', password):
			raise ValidationError('password-uppercase-error')
		if not re.findall('[0-9]', password):
			raise ValidationError('password-number-error')
		if not re.findall('[!@#$%^&*(),.?":{}|<>_+=\-/\\\\]', password):
			raise ValidationError('password-special-error')

	def get_help_text(self):
		return 'Your password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.'