import fs from 'node:fs';
import path from 'node:path';

export function listTargetConfigs(target = {}, env = process.env) {
  return (target.configWrites || []).map((config) => ({
    ...config,
    file: config.file(env),
  }));
}

export function writeTargetConfigs(target = {}, env = process.env) {
  for (const config of listTargetConfigs(target, env)) {
    if (config.kind === 'tomlPluginEnable') {
      writeCodexPluginEnable(config.file, config.pluginId);
    } else if (config.kind === 'copilotSettings') {
      writeCopilotSettings(config.file, config.marketplaceId, config.marketplaceSource, config.enabledPluginId);
    } else {
      throw new Error(`Unknown config writer kind: ${config.kind}`);
    }
  }
}

export function writeCodexPluginEnable(filePath, pluginId) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  writeAtomic(filePath, updateTomlPluginEnable(existing, pluginId));
}

export function writeCopilotSettings(filePath, marketplaceId, marketplaceSource, enabledPluginId) {
  const settings = readJsonObject(filePath);
  const extraKnownMarketplaces = objectProperty(settings, 'extraKnownMarketplaces', filePath);
  const enabledPlugins = objectProperty(settings, 'enabledPlugins', filePath);

  settings.extraKnownMarketplaces = prependObjectEntry(extraKnownMarketplaces, marketplaceId, {
    source: marketplaceSource,
  });
  settings.enabledPlugins = prependObjectEntry(enabledPlugins, enabledPluginId, true);

  writeAtomic(filePath, `${JSON.stringify(settings, null, 2)}\n`);
}

function updateTomlPluginEnable(content, pluginId) {
  const header = `[plugins."${pluginId}"]`;
  const table = `${header}\nenabled = true\n`;
  const tablePattern = new RegExp(`(^|\\n)${escapeRegExp(header)}\\n[\\s\\S]*?(?=\\n\\[|$)`);

  if (tablePattern.test(content)) {
    return ensureFinalNewline(content.replace(tablePattern, (match, prefix) => `${prefix}${table.trimEnd()}`));
  }

  if (content.trim().length === 0) {
    return table;
  }

  const withFinalNewline = ensureFinalNewline(content);
  return `${withFinalNewline}\n${table}`;
}

function readJsonObject(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  let parsed;
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
  }

  if (!isPlainObject(parsed)) {
    throw new Error(`Expected ${filePath} to contain a JSON object`);
  }

  return parsed;
}

function objectProperty(settings, key, filePath) {
  if (settings[key] === undefined) {
    return {};
  }
  if (!isPlainObject(settings[key])) {
    throw new Error(`Expected ${key} in ${filePath} to be a JSON object`);
  }
  return settings[key];
}

function prependObjectEntry(object, key, value) {
  const rest = { ...object };
  delete rest[key];
  return {
    [key]: value,
    ...rest,
  };
}

function writeAtomic(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(`${filePath}.tmp`, content);
  fs.renameSync(`${filePath}.tmp`, filePath);
}

function ensureFinalNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
