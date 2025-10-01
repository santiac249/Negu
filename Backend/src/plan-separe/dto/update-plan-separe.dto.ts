import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanSepareDto } from './create-plan-separe.dto';

export class UpdatePlanSepareDto extends PartialType(CreatePlanSepareDto) {}