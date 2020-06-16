export class TString extends String {
    range: [number, number]

    constructor(args) {
        super()
        this.range = args.range
    }
}

class _CopyRange {
    range: [number, number]

    constructor(args) {
        this.range = args.range
    }
}

export class TInteger extends _CopyRange {}
export class TFloat extends _CopyRange {}
export class TNamespace extends _CopyRange {}
export class TRange extends _CopyRange {}
export class TMetadata extends _CopyRange {}
export class TUrl extends _CopyRange {}
export class TSize extends _CopyRange {}
export class TTime extends _CopyRange {}
export class TFreq extends _CopyRange {}
export class TBitrate extends _CopyRange {}
export class TVersion extends _CopyRange {}
export class TImport extends _CopyRange {}
export class TConstraint extends _CopyRange {}
export class TProperty extends _CopyRange {}
export class TPropertyAssignment extends _CopyRange {}
export class TAttribute extends _CopyRange {}
export class TAttributeAssignement extends _CopyRange {}
export class TInput extends _CopyRange {}
export class Toutput extends _CopyRange {}
export class TRepository extends _CopyRange {}
export class TArtifactDef extends _CopyRange {}
export class TArtifactType extends _CopyRange {}
export class TImplementation extends _CopyRange {}
export class TOperationDef extends _CopyRange {}
export class TOperationDefTemplate extends _CopyRange {}
export class TInterfaceDef extends _CopyRange {}
export class TInterfaceDefTemplate extends _CopyRange {}
export class TCapabilityType extends _CopyRange {}
export class TCapabilityDef extends _CopyRange {}
export class TCapabilityAssignment extends _CopyRange {}
export class TPropertyFilter extends _CopyRange {}
export class TCapabilityFilter extends _CopyRange {}
export class TNodeFilter extends _CopyRange {}
export class TRequirementDef extends _CopyRange {}
export class TRequirementAssignment extends _CopyRange {}
export class TSubstitutionMappings extends _CopyRange {}
export class TTopologyTemplate extends _CopyRange {}
export class TServiceTemplate extends _CopyRange {}
