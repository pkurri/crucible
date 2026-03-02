/**
 * @file SupabaseEdgeFunctionForge: A Crucible Plugin for orchestrating Edge Function deployment.
 * @description This plugin empowers Crucible's Titanium and Ignis agents to forge and deploy
 *              serverless logic directly to the Supabase Edge, leveraging the platform's
 *              ephemeral compute capabilities for rapid task execution and micro-service hardening.
 *              It streamlines the process of staging, deploying, invoking, and purging functions,
 *              integrating Supabase's powerful Edge Functions into the Crucible ecosystem.
 * @aesthetic Modern Industrial Forge / Neobrutalism / Sci-Fi
 * @domain forge-agents.space
 * @agents Titanium (Deployment Frame), Ignis (Execution Engine)
 */

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

// --- Configuration & Environment Variables ---
// This plugin assumes the following environment variables are configured in the Crucible execution environment:
// - `SUPABASE_ACCESS_TOKEN`: Supabase CLI access token for deployment/management commands.
// - `SUPABASE_ANON_KEY`: Supabase anonymous key for client-side function invocation.
// - `SUPABASE_PROJECT_REF`: The reference ID of the Supabase project Crucible is targeting.
//
// It also assumes that `process.cwd()` is the root of a locally initialized Supabase project
// (i.e., where the `supabase` directory with `config.toml` resides).

export interface EdgeFunctionManifest {
  name: string; // The unique name for the Edge Function (e.g., 'data-transformer')
  code: string; // The full TypeScript source code content for the function (e.g., `Deno.serve(...)`)
  projectRef: string; // The specific Supabase project reference to deploy to.
  // Note: Environment variables for the function itself should be managed via Supabase's built-in secrets system.
}

// Defines the standard path where Supabase CLI expects function source files.
const SUPABASE_FUNCTIONS_DIR = path.join(process.cwd(), 'supabase', 'functions');

/**
 * The 'SupabaseEdgeFunctionForge' plugin.
 * This forge-grade utility facilitates the lifecycle management of Supabase Edge Functions,
 * providing Crucible agents with direct control over ephemeral compute resources.
 */
export const SupabaseEdgeFunctionForge = {

  /**
   * Forges, stages, and deploys a new or updated Edge Function to the Supabase Edge.
   * This process involves writing the provided function code to the local Supabase
   * project structure and then leveraging the `supabase CLI` for a robust, hardened deployment.
   * Crucible Agents: Primarily used by **Ignis** for execution ignition and **Titanium** for deployment hardening.
   *
   * @param manifest - The EdgeFunctionManifest describing the function to be deployed, including its source code.
   * @returns A promise that resolves with deployment output (stdout/stderr) or rejects on failure.
   * @throws Error if `projectRef` is missing or if the deployment command fails.
   */
  async deploy(manifest: EdgeFunctionManifest): Promise<{ stdout: string; stderr: string }> {
    const { name, code, projectRef } = manifest;

    if (!projectRef) {
      throw new Error('Crucible: Supabase Project Reference (projectRef) is critically required for deployment. Aborting forge sequence.');
    }

    const functionPath = path.join(SUPABASE_FUNCTIONS_DIR, name);
    const entrypointPath = path.join(functionPath, 'index.ts');

    console.log(`Crucible (Ignis): Staging Edge Function blueprint for '${name}' at ${entrypointPath}...`);

    try {
      // Ensure the target directory for the function's blueprint exists.
      await fs.mkdir(functionPath, { recursive: true });
      // Forge the function's source code into the entrypoint file.
      await fs.writeFile(entrypointPath, code, 'utf8');
      console.log(`Crucible (Ignis): Function code written for '${name}'. Initiating edge-deployment sequence...`);

      // Execute the Supabase CLI deploy command from the project root.
      // The `--no-verify-jwt` flag is included for broader applicability, but can be removed for stricter JWT validation.
      const deployCommand = `
        supabase functions deploy ${name} \
          --project-ref ${projectRef} \
          --no-verify-jwt
      `;

      const { stdout, stderr } = await execAsync(deployCommand, {
        cwd: process.cwd(), // Ensure command runs from the Supabase project root.
        env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN },
      });

      console.log(`Crucible (Titanium): Edge Function '${name}' successfully deployed and hardened to the Edge.`);
      return { stdout, stderr };
    } catch (error: any) {
      console.error(`Crucible (Ignis): Critical failure during Edge Function deployment for '${name}'. Error:`, error.message);
      // Optional: Clean up staged function code on failure for a pristine environment, or leave for post-mortem analysis.
      // await fs.rm(functionPath, { recursive: true, force: true });
      throw new Error(`Edge Function deployment failed: ${error.message}\nStderr: ${error.stderr || 'N/A'}\nStdout: ${error.stdout || 'N/A'}`);
    }
  },

  /**
   * Invokes an existing Edge Function via the Supabase client API.
   * This allows Crucible agents to trigger serverless logic for data processing, external calls, or state mutations.
   * Crucible Agents: Primarily used by **Ignis** for executing tasks and **Carbon** for data synthesis post-execution.
   *
   * @param functionName - The name of the Edge Function to invoke.
   * @param payload - The JSON payload to send to the function body.
   * @param projectRef - The Supabase project reference where the function resides.
   * @param headers - Optional headers for the invocation (e.g., 'Authorization' for authenticated calls).
   * @returns A promise resolving with the function's response data.
   * @throws Error if `projectRef` or `SUPABASE_ANON_KEY` is missing, or if the invocation fails.
   */
  async invoke(functionName: string, payload: Record<string, any>, projectRef: string, headers?: Record<string, string>): Promise<any> {
    if (!projectRef) {
      throw new Error('Crucible: Supabase Project Reference (projectRef) is critically required for invocation. Aborting.');
    }

    const supabaseUrl = `https://${projectRef}.supabase.co`;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Requires anon key for client-side invocation

    if (!supabaseAnonKey) {
      throw new Error('Crucible: SUPABASE_ANON_KEY environment variable is not set. Cannot establish secure channel for function invocation.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log(`Crucible (Ignis): Initiating invocation sequence for Edge Function '${functionName}'...`);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: { ...headers },
      });

      if (error) {
        console.error(`Crucible (Ignis): Error detected during invocation of Edge Function '${functionName}':`, error.message);
        throw error;
      }
      console.log(`Crucible (Ignis): Edge Function '${functionName}' executed successfully. Data payload received.`);
      return data;
    } catch (error: any) {
      console.error(`Crucible (Ignis): Catastrophic failure during Edge Function invocation for '${functionName}'. Error:`, error.message);
      throw new Error(`Edge Function invocation failed: ${error.message}`);
    }
  },

  /**
   * Purges (deletes) an existing Edge Function from the Supabase Edge.
   * This acts as a de-provisioning mechanism, removing ephemeral compute resources.
   * Crucible Agents: Primarily used by **Titanium** for reconfiguring deployment frames and **Ignis** for terminating obsolete processes.
   *
   * @param functionName - The name of the Edge Function to delete.
   * @param projectRef - The Supabase project reference from which to purge the function.
   * @returns A promise that resolves with deletion output or rejects on failure.
   * @throws Error if `projectRef` is missing or if the deletion command fails.
   */
  async purge(functionName: string, projectRef: string): Promise<{ stdout: string; stderr: string }> {
    if (!projectRef) {
      throw new Error('Crucible: Supabase Project Reference (projectRef) is critically required for purging. Aborting wipe.');
    }

    const purgeCommand = `
      supabase functions delete ${functionName} \
        --project-ref ${projectRef}
    `;

    console.log(`Crucible (Titanium): Initiating purge sequence for Edge Function '${functionName}'...`);
    try {
      const { stdout, stderr } = await execAsync(purgeCommand, {
        cwd: process.cwd(), // Ensure command runs from the Supabase project root.
        env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN },
      });
      console.log(`Crucible (Titanium): Edge Function '${functionName}' successfully purged from the Edge.`);
      return { stdout, stderr };
    } catch (error: any) {
      console.error(`Crucible (Titanium): Failure to purge Edge Function '${functionName}'. Error:`, error.message);
      throw new Error(`Edge Function deletion failed: ${error.message}\nStderr: ${error.stderr || 'N/A'}\nStdout: ${error.stdout || 'N/A'}`);
    }
  }
};
