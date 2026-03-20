import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-custom-auth",
};

const jsonResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, backupCode } = await req.json();

    if (!email || !backupCode) {
      return jsonResponse({ error: "Faltan datos: se requiere email y código de rescate." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse({ error: "Configuración del servidor incompleta (secrets)." }, 500);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar al usuario por email para obtener su ID real
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return jsonResponse({ error: `Error buscando usuario: ${listError.message}` }, 500);
    }

    const targetUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
      return jsonResponse({ error: "No se encontró ningún usuario con ese correo electrónico." }, 404);
    }

    console.log(`Verifying backup code for user: ${targetUser.id}`);

    // 2. Verificar el código de rescate usando el RPC de administración
    const { data: isValid, error: rpcError } = await supabaseAdmin.rpc('verify_and_burn_backup_code_admin', { 
      p_user_id: targetUser.id,
      p_code: backupCode 
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return jsonResponse({ error: `Error de base de datos: ${rpcError.message}` }, 500);
    }

    if (!isValid) {
      return jsonResponse({ error: "El código de rescate es incorrecto o ya ha sido utilizado." }, 401);
    }

    // 3. El código es válido -> Procedemos a eliminar TODOS los factores MFA
    // Nota: Eliminamos todos porque el objetivo es dar acceso al usuario.
    const { data: factorsData, error: fError } = await supabaseAdmin.auth.admin.mfa.listFactors({
      userId: targetUser.id
    });

    if (fError) {
      console.error("Error listing factors:", fError);
      return jsonResponse({ error: `Error gestionando MFA: ${fError.message}` }, 500);
    }

    let deletedCount = 0;
    if (factorsData?.factors) {
      for (const factor of factorsData.factors) {
        console.log(`Deleting factor: ${factor.id} for user ${targetUser.id}`);
        const { error: deleteError } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
          userId: targetUser.id,
          id: factor.id
        });
        
        if (deleteError) {
          console.error(`Failed to delete factor ${factor.id}:`, deleteError);
        } else {
          deletedCount++;
        }
      }
    }

    return jsonResponse({ 
      success: true, 
      message: `MFA desactivado con éxito. Se eliminaron ${deletedCount} factores. Ahora puedes volver a iniciar sesión.`,
      deletedCount
    });

  } catch (e: any) {
    console.error("Global Catch Edge Function:", e);
    return jsonResponse({ error: `Error crítico en el servidor: ${e.message}` }, 500);
  }
});
