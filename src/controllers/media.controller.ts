import { randomId } from '@/utils/helpers'
import { MultipartFile } from '@fastify/multipart'
import path from 'path'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import mime from 'mime-types'
import envConfig, { API_URL } from '@/config/config'
import supabase from '@/config/supabase.config'
const pump = util.promisify(pipeline)
// import supa

export const uploadImage = async (data: MultipartFile) => {
  const uniqueId = randomId()
  const ext = path.extname(data.filename)
  const id = uniqueId + ext
  const filepath = path.resolve(envConfig.UPLOAD_FOLDER, id)
  await pump(data.file, fs.createWriteStream(filepath))
  if (data.file.truncated) {
    // Xóa file nếu file bị trucated
    await fs.unlinkSync(filepath)
    throw new Error('Giới hạn file là 10MB')
  }
  const url = `${API_URL}` + '/static/' + id
  return url
}


// // upload use S3Client

// export const uploadImageS3 = async (data: MultipartFile): Promise<string> => {
//   const uniqueId = randomId()
//   const ext = path.extname(data.filename)
//   const id = `${uniqueId}${ext}`

//   const chunks: Uint8Array[] = []
//   for await (const chunk of data.file) {
//     chunks.push(chunk)
//   }
//   const buffer = Buffer.concat(chunks)
//   try {
//     const command = new PutObjectCommand({
//       Bucket: envConfig.AWS_BUCKET_NAME,
//       Key: `${id}`,
//       Body: buffer,
//       ContentType: 'image/jpeg'
//     })

//     await clientS3.send(command)
//     const s3Url = `https://${envConfig.AWS_BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${id}`
//     return s3Url
//   } catch (error) {
//     console.log('error s3', error)
//     return ''
//   }
// }



export const uploadFileSupabase = async (data: MultipartFile) => {
  const uniqueId = randomId()
  const ext = path.extname(data.filename)
  const id = uniqueId + ext
  // Đọc buffer từ MultipartFile
  const buffer = await data.toBuffer()
  // Upload buffer lên Supabase Storage
  const { data: uploadData, error } = await supabase.storage
    .from('uploads')  // Thay bằng tên bucket bạn tạo ở Supabase
    .upload(`${id}`, buffer, {
      contentType: data.mimetype,
      upsert: false // tránh ghi đè file cũ
    })

  if (error) {
    throw new Error('Upload lỗi: ' + error.message)
  }
  const publicUrl = supabase.storage
    .from('uploads')
    .getPublicUrl(`${id}`)

  return publicUrl.data.publicUrl
}