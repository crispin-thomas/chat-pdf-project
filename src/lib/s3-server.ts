import AWS from "aws-sdk";
import fs from "fs";

export async function downloadFromS3(file_key: string) {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACESS_KEY,
    });

    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      },
      region: "us-east-1",
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
      Key: file_key,
    };

    const object = s3.getObject(params).promise();
    const file_name = `tmp/pdf-${Date.now()}.pdf`;
    fs.writeFileSync(file_name, (await object).Body as Buffer);
    return file_name;
  } catch (error) {
    console.log(error);
    return null;
  }
}
