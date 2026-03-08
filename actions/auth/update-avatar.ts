"use server"

import { createClient } from "@/lib/supabase/server"
import { error } from "console"

export async function updateAvatar(formData: FormData) {

    const supabase = await createClient()

    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null

    // 1. Subir la imagen a Supabase Storage
    const fileExt = file?.name.split('.').pop()
    const filePath = `${userId}.${fileExt}`


    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file as Blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: file?.type
        })

        if(uploadError) {
            console.error('Error al subir la imagen:', uploadError)
            throw new Error(`Error al subir la imagen: ${uploadError.message}`)
        }


    // 2. Obtener la URL pública de la imagen
    const { data: publicUrlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    if(!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Error al obtener la URL pública de la imagen')
        throw new Error('Error al obtener la URL pública de la imagen')
    }

    // 3. Actualizar el perfil del usuario con la nueva URL del avatar
    const { error: updateError } = await supabase.from('profiles')
        .update({
             avatar_url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
         })
        .eq('id', userId)
        .single()

        if(updateError) {
            console.error('Error al actualizar el perfil del usuario:', updateError)
            throw new Error(`Error al actualizar el perfil del usuario: ${updateError.message}`)
        }

        return publicUrlData

}