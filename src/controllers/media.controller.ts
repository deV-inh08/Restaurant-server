import { randomId } from '@/utils/helpers'
import { MultipartFile } from '@fastify/multipart'
import path from 'path'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import mime from 'mime-types'
import supabase from '@/config/supabase.config'

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