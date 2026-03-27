import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# Base directory of the project (parent of app/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-only-secret-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-only-jwt-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    FINE_RATE = int(os.getenv('FINE_RATE', 5))  # Rs per day
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'mysql+mysqlconnector://root:aditya@localhost/pustak_tracker'
    )


class ProductionConfig(Config):
    DEBUG = False

    @property
    def SQLALCHEMY_DATABASE_URI(self):
        uri = os.getenv('DATABASE_URL')
        if not uri:
            raise RuntimeError(
                'DATABASE_URL environment variable must be set in production. '
                'Example: mysql+mysqlconnector://user:pass@host/dbname'
            )
        return uri

    @property
    def SECRET_KEY(self):
        key = os.getenv('SECRET_KEY')
        if not key or 'dev-only' in key or 'change-in-production' in key:
            raise RuntimeError('SECRET_KEY must be set to a real secret in production')
        return key
