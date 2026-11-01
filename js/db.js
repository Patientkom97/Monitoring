import { supabase } from './config.js';

export async function fetchCases() {
  const { data, error } = await supabase.from('cases').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertCase(caseData, file) {
  let attachmentUrl = null;
  if (file) {
    const filePath = `attachments/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
    attachmentUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from('cases').insert([{ ...caseData, attachment: attachmentUrl }]);
  if (error) throw error;
}

export async function updateCaseStatus(id, statut) {
  const { error } = await supabase.from('cases').update({ statut }).eq('id', id);
  if (error) throw error;
}

export async function deleteCase(id) {
  const { error } = await supabase.from('cases').delete().eq('id', id);
  if (error) throw error;
}