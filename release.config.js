/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ["main"],
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    [
      "@semantic-release/release-notes-generator",
      { preset: "conventionalcommits" },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: "# Changelog",
      },
    ],
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
