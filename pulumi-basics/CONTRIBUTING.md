# Guidelines for Contributing to this Repo
The goal for this repo is to support Pulumi training sessions.  
Training modules should teach pulumi concepts and provide a framework that allows students time and resources to get experience implementing the concepts.

# Training Module Structure
A training module consists of two main parts:
- Slides that explain the concepts being taught in the module.
- Code and related artifacts that are used for student exercises to reinforce the concepts presented in the slides.

## Training Module Slides
The training module slides should:
- Present the topics and concepts for the module.
- Include examples.
- Be stored in this repo as PDF files.
  - Source slide files should be stored in the Pulumi-internal customer engineering location.

## Code and Related Artifacts
The code and related artifacts should:
- Be stored in a module-specific directory.
- The module-specific directory should be stored in the appropriate `cloud-language` directory.
  - The naming convention of the module-specific directory should represent:
    - The relative order for the module as a progression of topics. (e.g. the "1" in `1_stack-basics`)
    - The topic for the module. (e.g. the "component-resources" in `3_component-resources`)
- The module-specific directory must be able to be downloaded using `pulumi new <URL>`.
  - This means it must include the starting Pulumi program (e.g. `__main__.py` or `index.ts`) and a `Pulumi.yaml` file.
- The module-specific directory must include the following:
  - Starting code (i.e. `__main__.py` or `index.ts`, etc)
  - `Pulumi.yaml` file
  - `README.md` file that describes the purpose of the module.
  - `EXERCISES.md` file that provides the exercises and any hints or supporting documentation links.
  - `solutions` directory that contains solutions for each exercise given in `EXERCISES.md`.

