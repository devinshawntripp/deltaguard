export async function GET() {
  return Response.json({
    schema_version: "v1",
    name_for_human: "ScanRook",
    name_for_model: "scanrook",
    description_for_human:
      "Scan container images for vulnerabilities, check packages for CVEs, and monitor license compliance.",
    description_for_model:
      "Use ScanRook to scan Docker/OCI container images for security vulnerabilities, check specific packages for known CVEs, analyze open source license compliance, and schedule recurring security scans. The API supports both authenticated operations (scanning, scheduling) and public queries (CVE lookup, package checking).",
    auth: { type: "service_http", authorization_type: "bearer" },
    api: { type: "openapi", url: "https://scanrook.io/api/v1/openapi" },
    logo_url: "https://scanrook.io/icon.svg",
    contact_email: "support@scanrook.io",
    legal_info_url: "https://scanrook.io/terms",
  });
}
