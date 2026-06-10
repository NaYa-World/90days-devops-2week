import { BootcampDay } from '../types';

export const day10: BootcampDay = {
  "day": 10,
  "title": "Maven — Build Tool Deep Dive",
  "subtitle": "pom.xml · Build Lifecycle · Dependencies · Test Reports · Jenkins Integration · Jenkinsfile\n            Update",
  "color": "#f89820",
  "trainerNote": "DevOps engineers don't write Java, but we must understand Maven's lifecycle (compile, test, package) to run CI/CD builds successfully.",
  "engineerNote": "Maven's `pom.xml` defines dependencies and plugins. In Jenkins, caching `~/.m2` dependencies saves gigabytes of network traffic per build.",
  "goal": {
    "icon": "🎯",
    "title": "🎯 Day 10 Goal",
    "description": "By end of Day 10: you understand the Maven build lifecycle deeply, can read and modify a pom.xml, can add\n          dependencies, and your Jenkins pipeline publishes a proper test report. Expected output: Jenkinsfile updated\n          with a full Maven pipeline — test results visible as a graph in Jenkins, JAR artifact accessible from the\n          build page."
  },
  "schedule": [
    {
      "time": "09:00–09:20",
      "phase": "RECALL",
      "activity": "Day 9 cold check",
      "why": "Push a commit. Webhook triggers Jenkins. All 4 stages\n                green. If not — fix before starting Maven depth."
    },
    {
      "time": "09:20–10:30",
      "phase": "THEORY",
      "activity": "Maven build lifecycle: validate → compile → test → package → verify → install →\n                deploy",
      "why": "Every phase explained. What happens at each stage. Why clean matters. Why mvn\n                install differs from mvn package."
    },
    {
      "time": "10:30–10:45",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "10:45–12:00",
      "phase": "HANDS-ON",
      "activity": "pom.xml anatomy: dependencies, plugins, properties",
      "why": "Add a real\n                dependency (JUnit 5, Lombok). Understand groupId:artifactId:version. Add a plugin. Change version\n                numbers. Read what Maven downloads and why."
    },
    {
      "time": "12:00–12:45",
      "phase": "BREAK",
      "activity": "Lunch",
      "why": ""
    },
    {
      "time": "12:45–14:30",
      "phase": "HANDS-ON",
      "activity": "Write unit tests + view test reports in Jenkins",
      "why": "Add 3 meaningful unit\n                tests to HelloController. Run mvn test locally. Then in Jenkins — JUnit plugin shows test pass/fail\n                graph across builds."
    },
    {
      "time": "14:30–15:30",
      "phase": "JENKINS",
      "activity": "Update Jenkinsfile with full Maven pipeline + test publishing",
      "why": "Add post\n                stage for test report publishing. Add build info stage. Add environment injection from pom.xml."
    },
    {
      "time": "15:30–15:45",
      "phase": "BREAK",
      "activity": "Break",
      "why": ""
    },
    {
      "time": "15:45–16:45",
      "phase": "PROJECT",
      "activity": "Mini Project: green pipeline with test reports",
      "why": ""
    },
    {
      "time": "16:45–17:00",
      "phase": "COMMIT",
      "activity": "Day 10 notes + quiz",
      "why": ""
    }
  ],
  "concepts": [
    {
      "icon": "🔄",
      "title": "Maven Build Lifecycle",
      "description": "Maven has three built-in lifecycles. The default lifecycle is what you use: validate →\n            compile → test → package → verify → install → deploy. Each phase runs all phases before it. Running\n            mvn package automatically runs validate, compile, test first.",
      "analogy": "This is why mvn package fails when tests fail — test runs before package. You cannot skip a\n            phase without explicitly telling Maven to (-DskipTests)."
    },
    {
      "icon": "📋",
      "title": "pom.xml — Project Object Model",
      "description": "The pom.xml is Maven's config file. It defines: project coordinates (groupId, artifactId, version),\n            dependencies (what libraries your code needs), plugins (what tools Maven uses during the build), and\n            properties (variables used throughout the file).",
      "analogy": "Every Maven project has exactly one pom.xml at its root. Understanding it is understanding your\n            entire build configuration in one file."
    },
    {
      "icon": "🏷",
      "title": "GAV Coordinates",
      "description": "Every Maven artifact is identified by three parts: GroupId (org.springframework.boot),\n            ArtifactId (spring-boot-starter-web), Version (3.2.5). This is called the\n            GAV coordinate. When you add a dependency to pom.xml, you give its GAV. Maven downloads it from Maven\n            Central.",
      "analogy": "\"What is a Maven dependency?\" Answer: \"A library identified by a GAV coordinate —\n            groupId, artifactId, version. Maven downloads it from a registry and makes it available at compile time.\""
    },
    {
      "icon": "📦",
      "title": "Maven Local Repository (.m2)",
      "description": "Maven caches every downloaded dependency in ~/.m2/repository/. First build: slow (downloads\n            from Maven Central). Subsequent builds: fast (uses local cache). On CI servers, the .m2 cache is often\n            persisted between builds for speed.",
      "analogy": "On Jenkins: first build after fresh EC2 = 3-5 minutes downloading. Second build = 20-30\n            seconds. This is normal — not a performance problem with your pipeline."
    },
    {
      "icon": "🧪",
      "title": "Surefire Plugin — Test Execution",
      "description": "The Maven Surefire plugin runs unit tests (files ending in Test.java or beginning with Test). It generates\n            XML reports in target/surefire-reports/. Jenkins reads these XML files to display test\n            pass/fail graphs and individual test results.",
      "analogy": "The JUnit step in Jenkinsfile (junit '**/target/surefire-reports/*.xml') tells\n            Jenkins to parse these XML files and display results in the UI — trend graphs, failed test details, test\n            history."
    },
    {
      "icon": "🔌",
      "title": "Maven Plugins",
      "description": "Maven plugins add behaviour to the build lifecycle. compiler-plugin compiles Java. surefire-plugin runs\n            tests. jar-plugin creates the JAR. You can add plugins like jacoco (code coverage), checkstyle (code style).\n            Each plugin binds to a lifecycle phase and runs automatically when that phase is reached.",
      "analogy": "SonarQube (Day 11) is integrated via the sonar-maven-plugin. JFrog (Day 12) uses the\n            artifactory-maven-plugin. Understanding plugins means understanding how every tool connects to your build."
    }
  ],
  "commands": [
    {
      "sessionNumber": 1,
      "totalSessions": 1,
      "sessionTitle": "Maven Lifecycle Commands — Run Each, Understand What Happens",
      "sections": [
        {
          "label": "Maven lifecycle phases — run these in order to understand each phase",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "cd\n              ~/devops-90days/devops-app"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn\n              validate # Validates pom.xml is correct — no compile"
            },
            {
              "type": "ok",
              "text": "[INFO] BUILD SUCCESS ← just validates the pom.xml structure"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn\n              compile # Compiles src/main/java → target/classes"
            },
            {
              "type": "output",
              "text": "[INFO] Compiling 2 source files to /home/ubuntu/devops-app/target/classes"
            },
            {
              "type": "ok",
              "text": "[INFO] BUILD SUCCESS"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn test # compile + compile test classes + run tests"
            },
            {
              "type": "ok",
              "text": "[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0"
            },
            {
              "type": "ok",
              "text": "[INFO] BUILD SUCCESS"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn\n              package # compile + test + create JAR in target/"
            },
            {
              "type": "ok",
              "text": "[INFO] Building jar: target/devops-app-1.0.0.jar"
            },
            {
              "type": "ok",
              "text": "[INFO] BUILD SUCCESS"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "ls -lh\n              target/*.jar"
            },
            {
              "type": "ok",
              "text": "-rw-r--r-- 1 ubuntu ubuntu 18M Jun 5 11:30 target/devops-app-1.0.0.jar"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn\n              install # package + copy JAR to local .m2 repository"
            },
            {
              "type": "output",
              "text": "[INFO] Installing target/devops-app-1.0.0.jar to\n            ~/.m2/repository/com/devops/devops-app/1.0.0/"
            },
            {
              "type": "output",
              "text": "# mvn install puts your JAR into your local .m2 so other local projects can depend on\n            it"
            },
            {
              "type": "output",
              "text": "# mvn deploy pushes to a remote registry (JFrog Artifactory — Day 12)"
            }
          ]
        },
        {
          "label": "Useful Maven flags",
          "lines": [
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn clean\n              package # delete target/ first, then build — always use in CI"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn clean package\n              -DskipTests # skip test execution (still compiles tests)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn clean package\n              -Dmaven.test.skip=true # skip compile AND run of tests"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn\n              dependency:tree # show all dependencies including transitive (dependencies of\n              dependencies)"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn dependency:tree |\n              grep \"spring\""
            },
            {
              "type": "output",
              "text": "[INFO] com.devops:devops-app:jar:1.0.0"
            },
            {
              "type": "output",
              "text": "[INFO] +- org.springframework.boot:spring-boot-starter-web:jar:3.2.5:compile"
            },
            {
              "type": "output",
              "text": "[INFO] | +- org.springframework.boot:spring-boot-starter:jar:3.2.5:compile"
            },
            {
              "type": "output",
              "text": "# Transitive: you added spring-boot-starter-web, it pulled in 15+ other dependencies"
            },
            {
              "type": "output",
              "text": "# This tree shows you exactly what is in your JAR"
            },
            {
              "type": "cmd",
              "prompt": "$",
              "text": "mvn\n              versions:display-dependency-updates # show which dependencies have newer\n              versions"
            }
          ]
        }
      ]
    }
  ],
  "debugTrees": [
    {
      "title": "⚡ Common Maven Build Failures",
      "steps": [
        {
          "num": 1,
          "title": "Tests fail: \"No tests found\" or wrong test file location",
          "description": "Maven Surefire\n              looks for *Test.java in src/test/java/. If your test file is not there, tests don't run.",
          "cmd": "ls src/test/java/com/devops/devopsapp/ → verify HelloControllerTest.java exists"
        },
        {
          "num": 2,
          "title": "Compilation error: \"package does not exist\"",
          "description": "A dependency in pom.xml is\n              wrong, or mvn compile needs to download first.",
          "cmd": "mvn dependency:resolve → downloads\n              all. Then retry mvn compile."
        },
        {
          "num": 3,
          "title": "Jenkins: \"Test results not found\" after junit step",
          "description": "The surefire-reports\n              path is wrong relative to workspace root.",
          "cmd": "Use: junit\n              'devops-app/target/surefire-reports/*.xml' (includes the devops-app/ subdirectory)"
        }
      ]
    }
  ],
  "mistakes": [
    {
      "mistake": "Using mvn package in the Test stage instead of mvn test",
      "description": "mvn package runs tests AND packages. If you put it in Test stage and Package stage, you run tests twice —\n              slow and redundant.",
      "fix": "Test stage: mvn test only. Package stage: mvn package\n              -DskipTests (tests already ran)."
    },
    {
      "mistake": "Not using mvn clean in CI — stale class files cause false positives",
      "description": "Without clean, if you rename a class, the old compiled .class file stays in target/. Tests may pass\n              locally but fail in production because of stale code.",
      "fix": "In Jenkins always use\n              mvn clean compile, mvn clean test, mvn clean package. The clean guarantees a fresh build from\n              source."
    },
    {
      "mistake": "Hardcoding version numbers in Jenkinsfile instead of reading from pom.xml",
      "description": "If you put APP_VERSION='1.0.0' in Jenkinsfile and later update pom.xml to 1.1.0, they drift. The JAR name\n              and the pipeline version disagree.",
      "fix": "Read version from pom.xml: sh \"mvn\n              help:evaluate -Dexpression=project.version -q -DforceStdout\". Single source of truth."
    }
  ],
  "project": {
    "tag": "📁 Day 10 Project",
    "title": "Jenkins Pipeline with Test Reports + Version from pom.xml",
    "timeEstimate": "⏱ ~60 min",
    "goal": "Update Jenkinsfile with version reading from pom.xml. Add 3 real\n            unit tests. Pipeline runs all stages green. Test results appear as a graph in Jenkins. JAR is named\n            devops-app-1.0.0.jar and archived.",
    "checklist": [
      "pom.xml version changed from 0.0.1-SNAPSHOT to 1.0.0",
      "3 unit tests written in HelloControllerTest.java covering /, /health, 404",
      "mvn test passes locally with \"Tests run: 3, Failures: 0\"",
      "Jenkinsfile reads version from pom.xml — echo shows \"Building: devops-app v1.0.0\"",
      "Jenkins Stage View: all 4 stages green",
      "Test Results graph visible in Jenkins (build → Test Result link)",
      "Artifact devops-app-1.0.0.jar downloadable from Jenkins build page",
      "Push Jenkinsfile + tests + updated pom.xml to GitHub — pipeline auto-triggers"
    ]
  },
  "interview": [
    {
      "question": "\"What is the difference between mvn package and mvn install?\"",
      "answer": "\"Both compile, run tests, and create\n          the JAR. The difference is what happens after packaging. mvn package creates the JAR in the local target/\n          directory — that's it. mvn install does everything package does, then copies the JAR into your local Maven\n          repository at ~/.m2/repository/. Other Maven projects on the same machine can then use your artifact as a\n          dependency by adding its GAV to their pom.xml. In a CI pipeline, you typically use mvn package — or mvn deploy\n          in Day 12 which goes further and uploads to a remote registry like JFrog Artifactory so other teams and\n          servers can use the artifact.\""
    }
  ],
  "quiz": [
    {
      "num": 1,
      "question": "You run mvn package. Which phases run in order?",
      "options": [
        {
          "text": "A) package → test → compile",
          "isCorrect": false
        },
        {
          "text": "B) validate → compile → test → package",
          "isCorrect": true
        },
        {
          "text": "C) compile → package (test skipped)",
          "isCorrect": false
        },
        {
          "text": "D) Only the package phase runs",
          "isCorrect": false
        }
      ],
      "explanation": "Maven lifecycle phases are sequential and cumulative. Running mvn package executes every phase\n          before it: validate (check pom.xml), compile (compile source), test (run unit tests), then package (create\n          JAR). This is why tests fail before packaging — test runs as part of the normal lifecycle."
    },
    {
      "num": 2,
      "question": "What does the scope=\"test\" in a pom.xml dependency mean?",
      "options": [
        {
          "text": "A) The dependency only works on test servers",
          "isCorrect": false
        },
        {
          "text": "B) The dependency is available only for compiling and running tests —\n            it is NOT included in the final JAR",
          "isCorrect": true
        },
        {
          "text": "C) The dependency version is for testing only",
          "isCorrect": false
        },
        {
          "text": "D) Maven skips this dependency during mvn test",
          "isCorrect": false
        }
      ],
      "explanation": "Maven dependency scopes control when a dependency is available. scope=test: available at test\n          compile time and test runtime, excluded from the final packaged JAR. This is correct for JUnit, Mockito — test\n          tools that have no business being in your production artifact. Other scopes: compile (default, in JAR),\n          provided (available but not bundled, e.g. servlet-api provided by Tomcat)."
    },
    {
      "num": 3,
      "question": "Where does Maven store downloaded dependencies on the server?",
      "options": [
        {
          "text": "A) /opt/maven/dependencies/",
          "isCorrect": false
        },
        {
          "text": "B) ~/.m2/repository/ in the home directory of the user running Maven",
          "isCorrect": true
        },
        {
          "text": "C) Inside the project's target/ directory",
          "isCorrect": false
        },
        {
          "text": "D) /var/maven/cache/",
          "isCorrect": false
        }
      ],
      "explanation": "~/.m2/repository/ is the local Maven repository. On Jenkins, the jenkins user's home is\n          /var/lib/jenkins so the cache is at /var/lib/jenkins/.m2/repository/. This is why first builds are slow\n          (downloads from Maven Central) and subsequent builds are fast (cache hit). Deleting .m2 forces a full\n          re-download."
    },
    {
      "num": 4,
      "question": "A test fails in Jenkins but passes locally. Most likely reason?",
      "options": [
        {
          "text": "A) Jenkins has a bug",
          "isCorrect": false
        },
        {
          "text": "B) Local build has stale files in target/ OR the Jenkins environment\n            differs (Java version, port in use, missing env var)",
          "isCorrect": true
        },
        {
          "text": "C) Maven version mismatch (usually)",
          "isCorrect": false
        },
        {
          "text": "D) The test is flaky and should be ignored",
          "isCorrect": false
        }
      ],
      "explanation": "First check: does the local build use mvn clean test or just mvn test? Without clean, stale\n          files may mask failures. Second: Jenkins runs as a different user (jenkins) with a different environment — no\n          GUI, different locale, different ports. Spring Boot tests starting a server on port 8080 fail if Jenkins\n          already uses 8080. Fix: use random ports in tests with @SpringBootTest(webEnvironment =\n          SpringBootTest.WebEnvironment.RANDOM_PORT)."
    },
    {
      "num": 5,
      "question": "What command shows all direct and transitive dependencies of your\n          project?",
      "options": [
        {
          "text": "A) mvn list-dependencies",
          "isCorrect": false
        },
        {
          "text": "B) mvn dependency:tree",
          "isCorrect": true
        },
        {
          "text": "C) mvn show-deps",
          "isCorrect": false
        },
        {
          "text": "D) cat pom.xml | grep dependency",
          "isCorrect": false
        }
      ],
      "explanation": "mvn dependency:tree prints the full dependency hierarchy including transitive dependencies —\n          libraries that your libraries depend on. This is essential for debugging classpath conflicts (two libraries\n          bringing in different versions of the same dependency) and for understanding why your JAR is large."
    }
  ],
  "github": {
    "filename": "devops-90days/day-10/README.md",
    "commitMessage": "docs: Add Day 10 — Maven\n            lifecycle, pom.xml, test reports in Jenkins",
    "template": "# Day 10 — Maven Build Tool Deep Dive\n**Date:** YYYY-MM-DD | **Difficulty:** Medium | **Status:** ✅ Complete\n\n## Roadmap Position\nJenkins ✓ → Maven ← HERE → SonarQube → JFrog → Docker → K8s\n\n## Maven Lifecycle (most important concept)\nvalidate → compile → test → package → verify → install → deploy\nEach phase runs ALL phases before it. mvn package = validate+compile+test+package.\n\n## Key Commands\n```bash\nmvn clean compile           # delete target/ then compile Java\nmvn test                    # compile + run unit tests\nmvn clean package           # clean + full lifecycle to JAR creation\nmvn clean package -DskipTests  # skip test execution\nmvn dependency:tree         # show all direct + transitive dependencies\nmvn versions:display-dependency-updates  # check for newer versions\n# Read version from pom.xml (for Jenkinsfile):\nmvn help:evaluate -Dexpression=project.version -q -DforceStdout\n```\n\n## pom.xml Key Sections\n- GAV: groupId + artifactId + version = unique identifier for this artifact\n- dependencies: libraries your code needs (scope=test = not in final JAR)\n- build/plugins: tools that run during the build lifecycle\n- properties: variables reused throughout pom.xml\n\n## Test Results in Jenkins\n- Surefire plugin generates XML reports in target/surefire-reports/\n- Jenkinsfile: junit 'devops-app/target/surefire-reports/*.xml'\n- Jenkins shows: test count graph across builds, individual test pass/fail\n\n## Tomorrow — Day 11\nSonarQube: install on EC2, configure Jenkins integration, add quality gate to pipeline"
  },
  "pdfUrl": "/pdfs/day10.pdf",
  "images": []
};
