import boto3
from app.core.config import settings

class S3Client:
    def __init__(self):
        self.client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_S3_BUCKET

    def upload_local_file(self, local_path: str, s3_key: str) -> str:
        self.client.upload_file(local_path, self.bucket_name, s3_key)
        return f"s3://{self.bucket_name}/{s3_key}"