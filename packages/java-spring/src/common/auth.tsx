import { code, refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { HttpAuth, HttpServiceAuthentication } from "@typespec/http";
import { springFramework } from "../spring/libraries/index.js";

// Temp list of currently supported schemes in the emitter. Will ignore any other auth
const supportedAuthSchemes = ["BearerAuth"];

/**
 * Emits auth configuration for the service based on provided auth.
 *
 * Note: Currently this only supports a single auth scheme configured on the entire service,
 * multiple auth schemes and per operation overrides will still have to be done
 *
 * @param auth
 */
export function emitAuth(auth: HttpServiceAuthentication) {
  // Get default auth scheme to use
  const defaultAuthScheme = auth?.defaultAuth?.options?.[0]?.all?.[0]?.auth as HttpAuth;

  // No auth, don't emit anything
  if (!defaultAuthScheme || !supportedAuthSchemes.includes(defaultAuthScheme.id)) {
    return null;
  }

  // The 'ServiceAuth' interface handles letting the user implement any auth logic.
  // For schemes such as Bearer auth or OAuth2 usually they implement the authentication urls
  // and maybe the client id or secrets.
  // For something like Basic or ApiKey auth, a method to say if the passed key/credentials are valid is used.

  return (
    <jv.PackageDirectory package="auth">
      <jv.SourceFile path="ServiceAuth.java">
        <jv.Interface public name="ServiceAuth">
          {emitMethods(defaultAuthScheme)}
        </jv.Interface>
      </jv.SourceFile>
      <jv.SourceFile path="AuthConfig.java">
        <jv.Annotation type={springFramework.Configuration} />
        <jv.Annotation type={springFramework.EnableWebSecurity} />
        <jv.Class public name="AuthConfig">
          <jv.Variable private final type={refkey("ServiceAuth")} name="auth" />

          <jv.Annotation type={springFramework.Autowired} />
          <jv.Constructor public name="AuthConfig" parameters={{ auth: refkey("ServiceAuth") }}>
            this.auth = auth;
          </jv.Constructor>

          <jv.Annotation type={springFramework.Bean} />
          <jv.Method
            public
            name="securityFilterChain"
            return={springFramework.SecurityFilterChain}
            parameters={{ http: springFramework.HttpSecurity }}
            throws="Exception"
          >
            {code`
              http
              .authorizeHttpRequests((authorize) -> authorize
                .anyRequest().authenticated()
              )
              ${emitConfigs(defaultAuthScheme)};
              return http.build();
            `}
          </jv.Method>

          {emitBeans(defaultAuthScheme)}
        </jv.Class>
      </jv.SourceFile>
    </jv.PackageDirectory>
  );
}

/**
 * Emits the beans used for certain validation, i.e JWT tokens
 *
 * @param auth The auth scheme to emit beans for
 */
function emitBeans(auth: HttpAuth) {
  const authType = auth.id;

  if (authType === "BearerAuth") {
    return (
      <>
        <jv.Annotation type={springFramework.Bean} />
        <jv.Method public name="jwtDecoder" return={springFramework.JwtDecoder}>
          return {springFramework.JwtDecoders}.fromIssuerLocation(auth.getIssuerUrl());
        </jv.Method>
      </>
    );
  }
}

/**
 * Emit the config builder to use within the security chain
 * to configure certain auth
 *
 * @param auth The auth scheme to emit the config for
 */
function emitConfigs(auth: HttpAuth) {
  const authType = auth.id;

  if (authType === "BearerAuth") {
    return code`
      .oauth2ResourceServer((oauth2) -> oauth2
        .jwt(${springFramework.Customizer}.withDefaults())
       )
    `;
  }
}

/**
 * Emit methods for the 'ServiceAuth' interface to be implemented. Different
 * ones need to be implemented based on the auth scheme
 *
 * @param auth Auth scheme to emit methods for
 */
function emitMethods(auth: HttpAuth) {
  const authType = auth.id;

  if (authType === "BearerAuth") {
    return <jv.Method name="getIssuerUrl" return="String" />;
  }
}
