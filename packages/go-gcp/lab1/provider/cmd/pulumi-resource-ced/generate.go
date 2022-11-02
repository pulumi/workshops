// Copyright 2016-2021, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//go:build ignore
// +build ignore

package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/pulumi/pulumi/pkg/v3/codegen/schema"
)

func main() {
	version, found := os.LookupEnv("VERSION")
	if !found {
		log.Fatal("version not found")
	}

	schemaPath, found := os.LookupEnv("SCHEMA")
	if !found {
		log.Fatal("schema not found")
	}

	schemaContents, err := ioutil.ReadFile(schemaPath)
	if err != nil {
		log.Fatal(err)
	}

	if strings.HasSuffix(schemaPath, ".yaml") {
		schemaContents, err = yaml.YAMLToJSON(schemaContents)
		if err != nil {
			log.Fatalf("reading YAML schema: %v", err)
		}
	}

	var packageSpec schema.PackageSpec
	err = json.Unmarshal(schemaContents, &packageSpec)
	if err != nil {
		log.Fatalf("cannot deserialize schema: %v", err)
	}

	packageSpec.Version = version
	versionedContents, err := json.Marshal(packageSpec)
	if err != nil {
		log.Fatalf("cannot reserialize schema: %v", err)
	}

	err = ioutil.WriteFile("./schema.go", []byte(fmt.Sprintf(`package main
var pulumiSchema = %#v
`, versionedContents)), 0600)
	if err != nil {
		log.Fatal(err)
	}
}
