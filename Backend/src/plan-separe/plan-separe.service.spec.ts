import { Test, TestingModule } from '@nestjs/testing';
import { PlanSepareService } from './plan-separe.service';

describe('PlanSepareService', () => {
  let service: PlanSepareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanSepareService],
    }).compile();

    service = module.get<PlanSepareService>(PlanSepareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
