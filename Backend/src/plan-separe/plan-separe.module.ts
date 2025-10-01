import { Module } from '@nestjs/common';
import { PlanSepareController } from './plan-separe.controller';
import { PlanSepareService } from './plan-separe.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [PlanSepareService],
    controllers: [PlanSepareController],
})
export class PlanSepareModule {}
