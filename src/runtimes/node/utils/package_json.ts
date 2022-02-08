import { promises as fs } from 'fs'

import pkgDir from 'pkg-dir'

interface PackageJson {
  name?: string
  version?: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
  optionalDependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  files?: string[]
  gypfile?: boolean
  binary?: boolean
  type?: string
}

const sanitiseFiles = (files: unknown): string[] | undefined => {
  if (!Array.isArray(files)) {
    return undefined
  }

  return files.filter((file) => typeof file === 'string')
}

const sanitisePackageJson = (packageJson: Record<string, unknown>): PackageJson => ({
  ...packageJson,
  files: sanitiseFiles(packageJson.files),
})

// Retrieve the `package.json` of a specific project or module
const getPackageJson = async function (srcDir: string): Promise<PackageJson> {
  const packageRoot = await pkgDir(srcDir)

  if (packageRoot === undefined) {
    return {}
  }

  const packageJsonPath = `${packageRoot}/package.json`
  try {
    // The path depends on the user's build, i.e. must be dynamic
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
    return sanitisePackageJson(packageJson)
  } catch (error) {
    throw new Error(`${packageJsonPath} is invalid JSON: ${error.message}`)
  }
}

const getPackageJsonIfAvailable = async (srcDir: string): Promise<PackageJson> => {
  try {
    const packageJson = await getPackageJson(srcDir)

    return packageJson
  } catch {
    return {}
  }
}

export { getPackageJson, getPackageJsonIfAvailable, PackageJson, sanitisePackageJson }
