import { ProjectDirectory, ProjectDirectoryProps, useProject } from "@alloy-js/java";

export interface SpringProjectProps extends ProjectDirectoryProps {
  /**
   * If this project has auth configured, should include authentication library
   */
  useAuth?: boolean;

  /**
   * Spring version to use for project
   */
  springVersion?: string;
}

/**
 * Sets up the project directory and dependencies needed for spring
 */
export function SpringProject(props: SpringProjectProps) {
  return (
    <ProjectDirectory {...props}>
      <SpringDependencies {...props} />
      {props.children}
    </ProjectDirectory>
  );
}

/**
 * Setup spring dependencies
 */
function SpringDependencies(props: SpringProjectProps) {
  const project = useProject();
  const springVersion = props.springVersion ?? "3.3.3";

  project.scope.addDependency({
    groupId: "org.springframework.boot",
    artifactId: "spring-boot-starter-web",
    version: springVersion,
  });
  if (props.useAuth) {
    project.scope.addDependency({
      groupId: "org.springframework.boot",
      artifactId: "spring-boot-starter-oauth2-resource-server",
      version: springVersion,
    });
  }
}
