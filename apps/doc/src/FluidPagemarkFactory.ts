import {IPagemarkRange} from "polar-shared/src/metadata/IPagemarkRange";

export interface IFluidPagemark {
    readonly range: IPagemarkRange;
}

export interface FluidPagemarkCreateOpts {
    readonly range: Range | undefined;

}

export interface FluidPagemarkFactory {

    /**
     * Create a fluid pagemark or undefined if one can't be created.
     */
    readonly create: (opts: FluidPagemarkCreateOpts) => IFluidPagemark | undefined;

}