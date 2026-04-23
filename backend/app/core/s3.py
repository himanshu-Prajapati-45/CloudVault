import boto3
from botocore.exceptions import ClientError
from app.core.config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def upload_to_s3(file_bytes: bytes, s3_key: str, content_type: str) -> str:
    """Upload a file to S3 and return the S3 key."""
    client = get_s3_client()
    try:
        client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_bytes,
            ContentType=content_type,
        )
        return s3_key
    except ClientError as e:
        raise Exception(f"S3 upload failed: {e}")


def delete_from_s3(s3_key: str) -> bool:
    """Delete a file from S3."""
    client = get_s3_client()
    try:
        client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)
        return True
    except ClientError:
        return False


def generate_presigned_url(s3_key: str, expires_in: int = 3600, filename: str = None) -> str:
    """Generate a temporary download URL valid for `expires_in` seconds."""
    client = get_s3_client()
    params = {"Bucket": settings.S3_BUCKET_NAME, "Key": s3_key}
    if filename:
        params["ResponseContentDisposition"] = f'attachment; filename="{filename}"'
        
    return client.generate_presigned_url(
        "get_object",
        Params=params,
        ExpiresIn=expires_in,
    )
