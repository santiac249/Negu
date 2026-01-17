// src/gastos/dto/update-gasto-recurrente.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoRecurrenteDto } from './create-gasto-recurrente.dto';

export class UpdateGastoRecurrenteDto extends PartialType(CreateGastoRecurrenteDto) {}
