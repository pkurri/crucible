import { CruciblePlugin, HookContext, Template } from '@crucible/core';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Example Template Plugin for Crucible
 * 
 * This plugin demonstrates how to add custom templates to Crucible.
 * It registers three example templates:
 * 1. minimal-api - Minimal API starter
 * 2. cli-tool - Command line tool template
 * 3. library - Reusable library template
 */
export default class ExampleTemplatePlugin implements CruciblePlugin {
  name = 'example-template-plugin';
  version = '1.0.0';
  description = 'Example template plugin demonstrating Crucible plugin system';

  private templatesDir: string;

  constructor() {
    this.templatesDir = path.join(__dirname, '..', 'templates');
  }

  /**
   * Activate the plugin
   * Called when the plugin is loaded
   */
  async activate(context: HookContext): Promise<void> {
    console.log(`[${this.name}] Activating plugin...`);

    // Register hook handlers
    context.on('template:register', this.registerTemplates.bind(this));
    context.on('template:before-render', this.beforeRender.bind(this));

    console.log(`[${this.name}] Plugin activated successfully`);
  }

  /**
   * Deactivate the plugin
   * Called when the plugin is being unloaded
   */
  async deactivate(): Promise<void> {
    console.log(`[${this.name}] Deactivating plugin...`);
    // Cleanup resources if needed
    console.log(`[${this.name}] Plugin deactivated`);
  }

  /**
   * Register templates with Crucible
   */
  private async registerTemplates(context: HookContext): Promise<Template[]> {
    console.log(`[${this.name}] Registering templates...`);

    const templates: Template[] = [
      {
        id: 'example-minimal-api',
        name: 'Minimal API Starter',
        description: 'A minimal API template with Express and TypeScript',
        category: 'backend',
        tags: ['api', 'express', 'minimal', 'typescript'],
        path: path.join(this.templatesDir, 'minimal-api'),
        config: {
          port: 3000,
          database: 'none',
          auth: false,
        },
      },
      {
        id: 'example-cli-tool',
        name: 'CLI Tool Template',
        description: 'Command-line tool starter with argument parsing',
        category: 'cli',
        tags: ['cli', 'commander', 'typescript', 'tool'],
        path: path.join(this.templatesDir, 'cli-tool'),
        config: {
          name: 'my-cli',
          commands: ['hello', 'goodbye'],
        },
      },
      {
        id: 'example-library',
        name: 'Library Package Template',
        description: 'Reusable library with TypeScript and testing setup',
        category: 'library',
        tags: ['library', 'npm', 'typescript', 'rollup'],
        path: path.join(this.templatesDir, 'library'),
        config: {
          bundler: 'rollup',
          testing: 'vitest',
          docs: 'typedoc',
        },
      },
    ];

    // Validate template paths exist
    for (const template of templates) {
      try {
        await fs.access(template.path);
        console.log(`[${this.name}] ✓ Template registered: ${template.name}`);
      } catch (error) {
        console.warn(`[${this.name}] ⚠ Template path not found: ${template.path}`);
      }
    }

    return templates;
  }

  /**
   * Pre-render hook - modify template before rendering
   */
  private async beforeRender(
    context: HookContext,
    template: Template,
    variables: Record<string, any>
  ): Promise<{ template: Template; variables: Record<string, any> }> {
    console.log(`[${this.name}] Pre-render hook for: ${template.name}`);

    // Add plugin-specific variables
    const enhancedVariables = {
      ...variables,
      pluginVersion: this.version,
      pluginName: this.name,
      generatedAt: new Date().toISOString(),
    };

    // Modify template if needed
    const enhancedTemplate = {
      ...template,
      config: {
        ...template.config,
        pluginEnhanced: true,
      },
    };

    return { template: enhancedTemplate, variables: enhancedVariables };
  }
}
